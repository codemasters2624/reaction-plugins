import executeBulkOperation from "../utils/executeBulkOperation.js";

/**
 *
 * @method updateDoorsVisibility
 * @summary Updates a set a doors visibility
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - Input arguments for the bulk operation
 * @param {String[]} input.doorIds - an array of Door IDs
 * @param {String} input.shopId - the shop's id
 * @param {String[]} input.isVisible - the desired visibility
 * @return {Number} A count of how many documents were successfully updated
 */
export default async function updateDoorsVisibility(context, input) {
  const { doorIds, shopId, isVisible } = input;
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

  // Generate update statements
  const operations = doorIds.map((doorId) => ({
    updateOne: {
      filter: {
        _id: doorId,
        shopId,
      },
      update: {
        $set: {
          isVisible,
        },
      },
    },
  }));

  const results = await executeBulkOperation(Doors, operations, totalDoors);

  return results;
}
