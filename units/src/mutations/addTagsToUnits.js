import executeBulkOperation from "../utils/executeBulkOperation.js";

/**
 *
 * @method addTagsToUnits
 * @summary Adds an array of tag ids to an array of units looked up by unit id.
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - Input arguments for the bulk operation
 * @param {String[]} input.unitIds - an array of Unit IDs
 * @param {String} input.shopId - the shop's id
 * @param {String[]} input.tagIds - an array of Tag IDs
 * @return {Object} Object with information of results of bulk the operation
 */
export default async function addTagsToUnits(context, input) {
  const { unitIds, shopId, tagIds } = input;
  const {
    collections: { Units },
  } = context;
  const totalUnits = unitIds.length;

  for (const _id of unitIds) {
    // TODO(pod-auth): figure out a better way to loop through this
    // eslint-disable-next-line no-await-in-loop
    await context.validatePermissions(
      `reaction:legacy:units:${_id}`,
      "update",
      { shopId }
    );
  }

  // // Generate update statements
  const operations = unitIds.map((unitId) => ({
    updateOne: {
      filter: {
        _id: unitId,
        shopId,
      },
      update: {
        $addToSet: {
          hashtags: { $each: tagIds },
        },
      },
    },
  }));

  const results = await executeBulkOperation(Units, operations, totalUnits);

  return results;
}
