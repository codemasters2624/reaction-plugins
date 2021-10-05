import { decodeUnitOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 *
 * @method cloneUnits
 * @summary Takes an array of unit IDs and clones units
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - mutation input object
 * @param {String} args.input.clientMutationId - The mutation id
 * @param {String[]} args.input.unitIds - an array of unit IDs to clone
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} cloneUnits payload
 */
export default async function cloneUnits(_, { input }, context) {
  const { clientMutationId, unitIds, shopId } = input;

  const decodedUnitIds = unitIds.map((unitId) => decodeUnitOpaqueId(unitId));

  const clonedUnits = await context.mutations.cloneUnits(context, {
    unitIds: decodedUnitIds,
    shopId: decodeShopOpaqueId(shopId),
  });

  return {
    clientMutationId,
    units: clonedUnits,
  };
}
