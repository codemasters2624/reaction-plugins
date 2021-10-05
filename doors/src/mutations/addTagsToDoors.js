import executeBulkOperation from "../utils/executeBulkOperation.js";

/**
 *
 * @method addTagsToDoors
 * @summary Adds an array of tag ids to an array of doors looked up by door id.
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - Input arguments for the bulk operation
 * @param {String[]} input.doorIds - an array of Door IDs
 * @param {String} input.shopId - the shop's id
 * @param {String[]} input.tagIds - an array of Tag IDs
 * @return {Object} Object with information of results of bulk the operation
 */
export default async function addTagsToDoors(context, input) {
  const { doorIds, shopId, tagIds } = input;
  const {
    collections: { Doors },
  } = context;
  const totalDoors = doorIds.length;

  for (const _id of doorIds) {
    // TODO(pod-auth): figure out a better way to loop through this
    // eslint-disable-next-line no-await-in-loop
    await context.validatePermissions(
      `reaction:legacy:doors:${_id}`,
      "update",
      { shopId }
    );
  }

  // // Generate update statements
  const operations = doorIds.map((doorId) => ({
    updateOne: {
      filter: {
        _id: doorId,
        shopId,
      },
      update: {
        $addToSet: {
          hashtags: { $each: tagIds },
        },
      },
    },
  }));

  const results = await executeBulkOperation(Doors, operations, totalDoors);

  return results;
}
