import {
  decodeShopOpaqueId,
  decodeUnitOpaqueId,
  decodeTagOpaqueId,
} from "../../xforms/id.js";

/**
 *
 * @method addTagsToUnits
 * @summary Takes an array of unitsIds and tagsIds
 * and performs a bulk operation to add an array of tag ids to an
 * array of units
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - mutation input object
 * @param {String} args.input.clientMutationId - The mutation id
 * @param {String[]} args.input.unitIds - an array of Unit IDs
 * @param {String} args.input.shopId - the shop id
 * @param {String[]} args.input.tagIds - an array of Tag IDs
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} Returns an object with information about the results
 * of the bulk operation
 */
export default async function addTagsToUnits(_, { input }, context) {
  const { clientMutationId } = input;
  const {
    unitIds: opaqueUnitIds,
    shopId: opaqueShopId,
    tagIds: opaqueTagIds,
  } = input;
  const unitIds = opaqueUnitIds.map(decodeUnitOpaqueId);
  const tagIds = opaqueTagIds.map(decodeTagOpaqueId);

  const results = await context.mutations.addTagsToUnits(context, {
    unitIds,
    shopId: decodeShopOpaqueId(opaqueShopId),
    tagIds,
  });

  return {
    clientMutationId,
    ...results,
  };
}
