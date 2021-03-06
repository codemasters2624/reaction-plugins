import Logger from "@reactioncommerce/logger";

const logCtx = { name: "core/door", file: " executeBulkOperation" };

/**
 *
 * @method executeBulkOperation
 * @summary Executes an array of operations in bulk
 * @param {Object[]} collection Mongo collection
 * @param {Object[]} operations bulk operations to perform
 * @param {Int} totalDoors total number of doors to operate on
 * @return {Object} Object with information of results of bulk the operations
 */
export default async function executeBulkOperation(
  collection,
  operations,
  totalDoors
) {
  let response;
  try {
    Logger.trace({ ...logCtx, operations }, "Running bulk operation");
    response = await collection.bulkWrite(operations, { ordered: false });
  } catch (error) {
    Logger.error({ ...logCtx, error }, "One or more of the bulk update failed");
    response = error; // error object has details about failed & successful operations
  }

  const {
    nMatched,
    nModified,
    result: { writeErrors },
  } = response;
  const notFoundCount = totalDoors - nMatched;

  const cleanedErrors = writeErrors.map((error) => ({
    documentId: error.op._id,
    errorMsg: error.errmsg,
  }));

  return {
    foundCount: nMatched,
    notFoundCount,
    updatedCount: nModified,
    writeErrors: cleanedErrors,
  };
}
