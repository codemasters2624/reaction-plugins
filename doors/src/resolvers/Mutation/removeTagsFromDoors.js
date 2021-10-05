import {
  decodeShopOpaqueId,
  decodeDoorOpaqueId,
  decodeTagOpaqueId,
} from "../../xforms/id.js";

/**
 *
 * @method removeTagsFromDoors
 * @summary Takes an array of doorsIds and tagsIds
 * and removes provided tags from the array of doors.
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - mutation input object
 * @param {String} args.input.clientMutationId - The mutation id
 * @param {String[]} args.input.doorIds - an array of Door IDs
 * @param {String} args.input.shopId - the shop id
 * @param {String[]} args.input.tagIds - an array of Tag IDs
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} Returns an object with information about the results
 * of the bulk operation
 */
export default async function removeTagsFromDoors(_, { input }, context) {
  const { clientMutationId } = input;
  const {
    doorIds: opaqueDoorIds,
    shopId: opaqueShopId,
    tagIds: opaqueTagIds,
  } = input;
  const doorIds = opaqueDoorIds.map(decodeDoorOpaqueId);
  const tagIds = opaqueTagIds.map(decodeTagOpaqueId);

  const results = await context.mutations.removeTagsFromDoors(context, {
    doorIds,
    shopId: decodeShopOpaqueId(opaqueShopId),
    tagIds,
  });

  return {
    clientMutationId,
    ...results,
  };
}
