import {
  decodeDoorOpaqueId,
  decodeShopOpaqueId,
  decodeTagOpaqueId,
} from "../../xforms/id.js";

/**
 *
 * @method updateDoor
 * @summary Updates various door fields
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - mutation input object
 * @param {String} args.input.clientMutationId - The mutation id
 * @param {String} args.input.door - door fields to update
 * @param {String} args.input.doorId - doorId of door to update
 * @param {String} args.input.shopId - shopId of shop door belongs to
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} updateDoor payload
 */
export default async function updateDoor(_, { input }, context) {
  const { clientMutationId = null, door: doorInput, doorId, shopId } = input;

  if (Array.isArray(doorInput.tagIds)) {
    doorInput.hashtags = doorInput.tagIds.map(decodeTagOpaqueId);
    delete doorInput.tagIds;
  }

  const updatedDoor = await context.mutations.updateDoor(context, {
    door: doorInput,
    doorId: decodeDoorOpaqueId(doorId),
    shopId: decodeShopOpaqueId(shopId),
  });

  return {
    clientMutationId,
    door: updatedDoor,
  };
}
