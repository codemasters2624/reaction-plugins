import _ from "lodash";
import SimpleSchema from "simpl-schema";
import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import copyMedia from "../utils/copyMedia.js";

const inputSchema = new SimpleSchema({
  shopId: String,
  variantIds: Array,
  "variantIds.$": {
    type: String,
  },
});

/**
 *
 * @method cloneUnitVariants
 * @summary clones a unit variant into a new variant
 * @description the method copies variants, but will also create and clone
 * child variants (options)
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - Input arguments for the bulk operation
 * @param {String} input.shopId - shop these variants belong to
 * @param {String} input.variantIds - an array of decoded variant IDs to clone
 * @return {Array} list with cloned variant Ids
 */
export default async function cloneUnitVariants(context, input) {
  inputSchema.validate(input);
  const { collections } = context;
  const { Units } = collections;
  const { shopId, variantIds } = input;

  // TODO(pod-auth): create helper to handle multiple permissions checks for multiple items
  for (const variantId of variantIds) {
    // eslint-disable-next-line no-await-in-loop
    await context.validatePermissions(
      `reaction:legacy:units:${variantId}`,
      "clone",
      { shopId }
    );
  }

  // Check to make sure all variants are on the same shop
  const count = await Units.find({
    _id: { $in: variantIds },
    type: "variant",
    shopId,
  }).count();
  if (count !== variantIds.length)
    throw new ReactionError("not-found", "One or more variants do not exist");

  const newVariants = await Promise.all(
    variantIds.map(async (variantId) => {
      const existingVariant = await Units.findOne({ _id: variantId });
      const unitId = existingVariant.ancestors[0];

      const existingVariants = await Units.find({
        $or: [
          {
            _id: variantId,
          },
          {
            ancestors: {
              $in: [variantId],
            },
            isDeleted: false,
          },
        ],
        type: "variant",
      }).toArray();

      // If there are no variants, return empty array
      if (existingVariants.length === 0) return null;

      const variantNewId = Random.id();

      // make sure that top level variant will be cloned first
      const sortedVariants = _.sortBy(
        existingVariants,
        (sortedVariant) => sortedVariant.ancestors.length
      );

      await Promise.all(
        sortedVariants.map(async (sortedVariant) => {
          const originalVariantId = sortedVariant._id;
          let type = "child";
          let clonedVariantObject;
          if (variantId === sortedVariant._id) {
            type = "parent";
            clonedVariantObject = {
              ...sortedVariant,
              _id: variantNewId,
              title: `${sortedVariant.title || "Untitled"} - copy`,
              optionTitle: `${sortedVariant.optionTitle || "Untitled"} - copy`,
            };
          } else {
            const parentIndex = sortedVariant.ancestors.indexOf(variantId);
            const ancestorsClone = sortedVariant.ancestors.slice(0);
            // if variantId exists in ancestors, we override it by new _id
            if (parentIndex >= 0)
              ancestorsClone.splice(parentIndex, 1, variantNewId);

            clonedVariantObject = {
              ...existingVariant,
              _id: Random.id(),
              ancestors: ancestorsClone,
            };

            if (typeof sortedVariant.title === "string") {
              clonedVariantObject.title = sortedVariant.title;
            }

            if (typeof sortedVariant.optionTitle === "string") {
              clonedVariantObject.optionTitle = sortedVariant.optionTitle;
            }

            if (
              typeof sortedVariant.height === "number" &&
              sortedVariant.height >= 0
            ) {
              clonedVariantObject.height = sortedVariant.height;
            }

            if (
              typeof sortedVariant.width === "number" &&
              sortedVariant.width >= 0
            ) {
              clonedVariantObject.width = sortedVariant.width;
            }

            if (
              typeof sortedVariant.weight === "number" &&
              sortedVariant.weight >= 0
            ) {
              clonedVariantObject.weight = sortedVariant.weight;
            }

            if (
              typeof sortedVariant.length === "number" &&
              sortedVariant.length >= 0
            ) {
              clonedVariantObject.length = sortedVariant.length;
            }
          }
          delete clonedVariantObject.updatedAt;
          delete clonedVariantObject.createdAt;

          // Apply custom transformations from plugins.
          for (const customFunc of context.getFunctionsOfType(
            "mutateNewVariantBeforeCreate"
          )) {
            // Functions of type "mutateNewVariantBeforeCreate" are expected to mutate the provided variant.
            // We need to run each of these functions in a series, rather than in parallel, because
            // we are mutating the same object on each pass.
            // eslint-disable-next-line no-await-in-loop
            await customFunc(clonedVariantObject, {
              context,
              isOption: clonedVariantObject.ancestors.length > 1,
            });
          }

          // copy media to new variant
          await copyMedia(
            context,
            unitId,
            originalVariantId,
            clonedVariantObject._id
          );

          const { insertedId: clonedVariantId } = await Units.insertOne(
            clonedVariantObject,
            { validate: false }
          );

          if (!clonedVariantId) {
            Logger.error(`cloneUnitVariants: cloning of ${variantId} failed`);
            throw new ReactionError(
              "server-error",
              `Cloning of ${variantId} failed`
            );
          }

          Logger.debug(
            `cloneUnitVariants: created ${
              type === "child" ? "sub child " : ""
            }clone: ${clonedVariantObject._id} from ${variantId}`
          );
        })
      );

      const newFinalUnit = await Units.findOne({ _id: variantNewId });

      return newFinalUnit;
    })
  );

  return newVariants;
}
