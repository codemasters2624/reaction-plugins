import { decodeDoorOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 *
 * @method cloneDoors
 * @summary Takes an array of door IDs and clones doors
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - mutation input object
 * @param {String} args.input.clientMutationId - The mutation id
 * @param {String[]} args.input.doorIds - an array of door IDs to clone
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} cloneDoors payload
 */
export default async function cloneDoors(_, { input }, context) {
  const { clientMutationId, doorIds, shopId } = input;

  const decodedDoorIds = doorIds.map((doorId) => decodeDoorOpaqueId(doorId));

  const clonedDoors = await context.mutations.cloneDoors(context, {
    doorIds: decodedDoorIds,
    shopId: decodeShopOpaqueId(shopId),
  });

  return {
    clientMutationId,
    doors: clonedDoors,
  };
}
