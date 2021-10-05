import { decodeDoorOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 *
 * @method updateDoorsVisibility
 * @summary Takes an array of door IDs and sets their visibility property
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - mutation input object
 * @param {Array<String>} args.input.doorIds - an array of decoded door IDs to archive
 * @param {String} args.input.shopId - shop these doors belong to
 * @param {String} args.input.isVisible - the desired door visibility
 * @param {Object} context - an object containing the per-request state
 * @return {Object} Includes a property that indicates the number of updated documents
 */
export default async function updateDoorsVisibility(_, { input }, context) {
  const { clientMutationId, doorIds, shopId, isVisible } = input;

  const decodedDoorIds = doorIds.map((doorId) => decodeDoorOpaqueId(doorId));

  const { updatedCount } = await context.mutations.updateDoorsVisibility(
    context,
    {
      doorIds: decodedDoorIds,
      shopId: decodeShopOpaqueId(shopId),
      isVisible,
    }
  );

  return {
    clientMutationId,
    updatedCount,
  };
}
