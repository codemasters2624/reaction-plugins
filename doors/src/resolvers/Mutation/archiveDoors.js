import { decodeDoorOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 *
 * @method archiveDoors
 * @summary Takes an array of door IDs and archives doors
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - mutation input object
 * @param {String} args.input.doorIds - an array of decoded door IDs to archive
 * @param {String} args.input.shopId - shop these doors belong to
 * @param {Object} context - an object containing the per-request state
 * @return {Array} array with archived doors
 */
export default async function archiveDoors(_, { input }, context) {
  const { clientMutationId, doorIds, shopId } = input;

  const decodedDoorIds = doorIds.map((doorId) => decodeDoorOpaqueId(doorId));

  const archivedDoors = await context.mutations.archiveDoors(context, {
    doorIds: decodedDoorIds,
    shopId: decodeShopOpaqueId(shopId),
  });

  return {
    clientMutationId,
    doors: archivedDoors,
  };
}
