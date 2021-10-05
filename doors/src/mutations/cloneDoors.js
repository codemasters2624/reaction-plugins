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
  doorIds: Array,
  "doorIds.$": {
    type: String,
  },
  shopId: String,
});

/**
 *
 * @method cloneDoors
 * @summary clones a door into a new door
 * @description the method copies doors, but will also create and clone
 * child variants and options
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - Input arguments for the bulk operation
 * @param {String} input.doorIds - an array of decoded door IDs to clone
 * @param {String} input.shopId - shop these doors belong to
 * @return {Array} list with cloned door Ids
 */
export default async function cloneDoors(context, input) {
  inputSchema.validate(input);
  const { collections } = context;
  const { Doors } = collections;
  const { doorIds, shopId } = input;

  // TODO(pod-auth): create helper to handle multiple permissions checks for multiple items
  for (const doorId of doorIds) {
    // eslint-disable-next-line no-await-in-loop
    await context.validatePermissions(
      `reaction:legacy:doors:${doorId}`,
      "clone",
      { shopId }
    );
  }

  // Check to make sure all variants are on the same shop
  const count = await Doors.find({
    _id: { $in: doorIds },
    type: "simple",
    shopId,
  }).count();
  if (count !== doorIds.length)
    throw new ReactionError("not-found", "One or more doors do not exist");

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

  const newDoors = await Promise.all(
    doorIds.map(async (doorId) => {
      const door = await Doors.findOne({ _id: doorId });

      // cloning door
      const doorNewId = Random.id();
      setId({
        oldId: door._id,
        newId: doorNewId,
      });

      const newDoor = Object.assign({}, door, {
        _id: doorNewId,
      });
      delete newDoor.updatedAt;
      delete newDoor.createdAt;
      delete newDoor.publishedAt;
      delete newDoor.positions;
      delete newDoor.handle;
      newDoor.isVisible = false;
      if (newDoor.title) {
        newDoor.title = await createTitle(context, newDoor.title, newDoor._id);
        newDoor.handle = await createHandle(
          context,
          getSlug(newDoor.title),
          newDoor._id,
          newDoor.shopId
        );
      }

      const { insertedId: doorInsertedId } = await Doors.insertOne(newDoor, {
        validate: false,
      });

      if (!doorInsertedId) {
        Logger.error(`cloneDoors: cloning of door ${door._id} failed`);
        throw new ReactionError(
          "server-error",
          `Cloning of door ${door._id} failed`
        );
      }

      // cloning variants
      const existingVariants = await Doors.find({
        ancestors: {
          $in: [door._id],
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

          const { insertedId: variantInsertedId } = await Doors.insertOne(
            newVariant,
            { validate: false }
          );
          if (!variantInsertedId) {
            Logger.error(
              `cloneDoors: cloning of variant ${variant._id} failed`
            );
            throw new ReactionError(
              "server-error",
              `Cloning of variant ${variant._id} failed`
            );
          }

          await copyMedia(context, doorNewId, variant._id, variantNewId);
        })
      );

      const newFinalDoor = await Doors.findOne({ _id: doorNewId });

      return newFinalDoor;
    })
  );

  return newDoors;
}
