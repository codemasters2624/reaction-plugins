import { decodeShopOpaqueId, decodeTagOpaqueId } from "../../xforms/id.js";

/**
 *
 * @method createDoor
 * @summary initializes empty door template, with empty variant
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - mutation input object
 * @param {String} [args.input.clientMutationId] - The mutation id
 * @param {String} [args.input.door] - door data
 * @param {Boolean} [input.shouldCreateFirstVariant] - Auto-create one variant for the door
 * @param {String} args.input.shopId - shopId of shop to create door for
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} createDoor payload
 */
export default async function createDoor(_, { input }, context) {
  const {
    clientMutationId = null,
    door: doorInput,
    shopId,
    shouldCreateFirstVariant,
  } = input;

  if (doorInput && Array.isArray(doorInput.tagIds)) {
    doorInput.hashtags = doorInput.tagIds.map(decodeTagOpaqueId);
    delete doorInput.tagIds;
  }

  const door = await context.mutations.createDoor(context, {
    door: doorInput,
    shopId: decodeShopOpaqueId(shopId),
    shouldCreateFirstVariant,
  });

  return {
    clientMutationId,
    door,
  };
}
