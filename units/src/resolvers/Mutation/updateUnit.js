import {
  decodeUnitOpaqueId,
  decodeShopOpaqueId,
  decodeTagOpaqueId,
} from "../../xforms/id.js";

/**
 *
 * @method updateUnit
 * @summary Updates various unit fields
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - mutation input object
 * @param {String} args.input.clientMutationId - The mutation id
 * @param {String} args.input.unit - unit fields to update
 * @param {String} args.input.unitId - unitId of unit to update
 * @param {String} args.input.shopId - shopId of shop unit belongs to
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} updateUnit payload
 */
export default async function updateUnit(_, { input }, context) {
  const { clientMutationId = null, unit: unitInput, unitId, shopId } = input;

  if (Array.isArray(unitInput.tagIds)) {
    unitInput.hashtags = unitInput.tagIds.map(decodeTagOpaqueId);
    delete unitInput.tagIds;
  }

  const updatedUnit = await context.mutations.updateUnit(context, {
    unit: unitInput,
    unitId: decodeUnitOpaqueId(unitId),
    shopId: decodeShopOpaqueId(shopId),
  });

  return {
    clientMutationId,
    unit: updatedUnit,
  };
}
