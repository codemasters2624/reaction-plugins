import { decodeUnitOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 *
 * @method updateUnitsVisibility
 * @summary Takes an array of unit IDs and sets their visibility property
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - mutation input object
 * @param {Array<String>} args.input.unitIds - an array of decoded unit IDs to archive
 * @param {String} args.input.shopId - shop these units belong to
 * @param {String} args.input.isVisible - the desired unit visibility
 * @param {Object} context - an object containing the per-request state
 * @return {Object} Includes a property that indicates the number of updated documents
 */
export default async function updateUnitsVisibility(_, { input }, context) {
  const { clientMutationId, unitIds, shopId, isVisible } = input;

  const decodedUnitIds = unitIds.map((unitId) => decodeUnitOpaqueId(unitId));

  const { updatedCount } = await context.mutations.updateUnitsVisibility(
    context,
    {
      unitIds: decodedUnitIds,
      shopId: decodeShopOpaqueId(shopId),
      isVisible,
    }
  );

  return {
    clientMutationId,
    updatedCount,
  };
}
