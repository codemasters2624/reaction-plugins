/* eslint-disable no-await-in-loop */
import _ from "lodash";
import SimpleSchema from "simpl-schema";
import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import getSlug from "@reactioncommerce/api-utils/getSlug.js";
import copyMedia from "../utils/copyMedia.js";
import createHandle from "../utils/createHandle.js";
import createTitle from "../utils/createTitle.js";

const inputSchema = new SimpleSchema({
  unitIds: Array,
  "unitIds.$": {
    type: String,
  },
  shopId: String,
});

/**
 *
 * @method cloneUnits
 * @summary clones a unit into a new unit
 * @description the method copies units, but will also create and clone
 * child variants and options
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - Input arguments for the bulk operation
 * @param {String} input.unitIds - an array of decoded unit IDs to clone
 * @param {String} input.shopId - shop these units belong to
 * @return {Array} list with cloned unit Ids
 */
export default async function cloneUnits(context, input) {
  inputSchema.validate(input);
  const { collections } = context;
  const { Units } = collections;
  const { unitIds, shopId } = input;

  // TODO(pod-auth): create helper to handle multiple permissions checks for multiple items
  for (const unitId of unitIds) {
    // eslint-disable-next-line no-await-in-loop
    await context.validatePermissions(
      `reaction:legacy:units:${unitId}`,
      "clone",
      { shopId }
    );
  }

  // Check to make sure all variants are on the same shop
  const count = await Units.find({
    _id: { $in: unitIds },
    type: "simple",
    shopId,
  }).count();
  if (count !== unitIds.length)
    throw new ReactionError("not-found", "One or more units do not exist");

  const idPairs = []; // idPairs: { oldId, newId }

  // eslint-disable-next-line require-jsdoc
  function getIds(id) {
    return idPairs.filter(
      function (pair) {
        return pair.oldId === this.id;
      },
      {
        id,
      }
    );
  }

  // eslint-disable-next-line require-jsdoc
  function setId(ids) {
    return idPairs.push(ids);
  }

  // eslint-disable-next-line require-jsdoc
  function buildAncestors(ancestors) {
    const newAncestors = [];
    ancestors.map((oldId) => {
      const pair = getIds(oldId);
      newAncestors.push(pair[0].newId);
      return newAncestors;
    });
    return newAncestors;
  }

  const newUnits = await Promise.all(
    unitIds.map(async (unitId) => {
      const unit = await Units.findOne({ _id: unitId });

      // cloning unit
      const unitNewId = Random.id();
      setId({
        oldId: unit._id,
        newId: unitNewId,
      });

      const newUnit = Object.assign({}, unit, {
        _id: unitNewId,
      });
      delete newUnit.updatedAt;
      delete newUnit.createdAt;
      delete newUnit.publishedAt;
      delete newUnit.positions;
      delete newUnit.handle;
      newUnit.isVisible = false;
      if (newUnit.title) {
        newUnit.title = await createTitle(context, newUnit.title, newUnit._id);
        newUnit.handle = await createHandle(
          context,
          getSlug(newUnit.title),
          newUnit._id,
          newUnit.shopId
        );
      }

      const { insertedId: unitInsertedId } = await Units.insertOne(newUnit, {
        validate: false,
      });

      if (!unitInsertedId) {
        Logger.error(`cloneUnits: cloning of unit ${unit._id} failed`);
        throw new ReactionError(
          "server-error",
          `Cloning of unit ${unit._id} failed`
        );
      }

      // cloning variants
      const existingVariants = await Units.find({
        ancestors: {
          $in: [unit._id],
        },
        type: "variant",
      }).toArray();

      // make sure that top level variant will be cloned first
      const sortedVariants = _.sortBy(
        existingVariants,
        (sortedVariant) => sortedVariant.ancestors.length
      );
      await Promise.all(
        sortedVariants.map(async (variant) => {
          const variantNewId = Random.id();
          setId({
            oldId: variant._id,
            newId: variantNewId,
          });

          const ancestors = buildAncestors(variant.ancestors);
          const newVariant = Object.assign({}, variant, {
            _id: variantNewId,
            ancestors,
          });
          delete newVariant.updatedAt;
          delete newVariant.createdAt;

          const { insertedId: variantInsertedId } = await Units.insertOne(
            newVariant,
            { validate: false }
          );
          if (!variantInsertedId) {
            Logger.error(
              `cloneUnits: cloning of variant ${variant._id} failed`
            );
            throw new ReactionError(
              "server-error",
              `Cloning of variant ${variant._id} failed`
            );
          }

          await copyMedia(context, unitNewId, variant._id, variantNewId);
        })
      );

      const newFinalUnit = await Units.findOne({ _id: unitNewId });

      return newFinalUnit;
    })
  );

  return newUnits;
}
