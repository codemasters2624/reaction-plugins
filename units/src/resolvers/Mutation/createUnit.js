import { decodeShopOpaqueId, decodeTagOpaqueId } from "../../xforms/id.js";

/**
 *
 * @method createUnit
 * @summary initializes empty unit template, with empty variant
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - mutation input object
 * @param {String} [args.input.clientMutationId] - The mutation id
 * @param {String} [args.input.unit] - unit data
 * @param {Boolean} [input.shouldCreateFirstVariant] - Auto-create one variant for the unit
 * @param {String} args.input.shopId - shopId of shop to create unit for
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} createUnit payload
 */
export default async function createUnit(_, { input }, context) {
  const {
    clientMutationId = null,
    unit: unitInput,
    shopId,
    shouldCreateFirstVariant,
  } = input;

  if (unitInput && Array.isArray(unitInput.tagIds)) {
    unitInput.hashtags = unitInput.tagIds.map(decodeTagOpaqueId);
    delete unitInput.tagIds;
  }

  const unit = await context.mutations.createUnit(context, {
    unit: unitInput,
    shopId: decodeShopOpaqueId(shopId),
    shouldCreateFirstVariant,
  });

  return {
    clientMutationId,
    unit,
  };
}
