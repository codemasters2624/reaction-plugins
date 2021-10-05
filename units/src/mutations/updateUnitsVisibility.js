import executeBulkOperation from "../utils/executeBulkOperation.js";

/**
 *
 * @method updateUnitsVisibility
 * @summary Updates a set a units visibility
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - Input arguments for the bulk operation
 * @param {String[]} input.unitIds - an array of Unit IDs
 * @param {String} input.shopId - the shop's id
 * @param {String[]} input.isVisible - the desired visibility
 * @return {Number} A count of how many documents were successfully updated
 */
export default async function updateUnitsVisibility(context, input) {
  const { unitIds, shopId, isVisible } = input;
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

  // Generate update statements
  const operations = unitIds.map((unitId) => ({
    updateOne: {
      filter: {
        _id: unitId,
        shopId,
      },
      update: {
        $set: {
          isVisible,
        },
      },
    },
  }));

  const results = await executeBulkOperation(Units, operations, totalUnits);

  return results;
}
