import { decodeUnitOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 *
 * @method archiveUnits
 * @summary Takes an array of unit IDs and archives units
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - mutation input object
 * @param {String} args.input.unitIds - an array of decoded unit IDs to archive
 * @param {String} args.input.shopId - shop these units belong to
 * @param {Object} context - an object containing the per-request state
 * @return {Array} array with archived units
 */
export default async function archiveUnits(_, { input }, context) {
  const { clientMutationId, unitIds, shopId } = input;

  const decodedUnitIds = unitIds.map((unitId) => decodeUnitOpaqueId(unitId));

  const archivedUnits = await context.mutations.archiveUnits(context, {
    unitIds: decodedUnitIds,
    shopId: decodeShopOpaqueId(shopId),
  });

  return {
    clientMutationId,
    units: archivedUnits,
  };
}
