/**
 * @name unit
 * @method
 * @memberof GraphQL/Unit
 * @summary Query the Units collection for a single unit
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Request input
 * @param {String} input.unitId - Unit ID
 * @param {String} input.shopId - Shop ID
 * @returns {Promise<Object>} Unit object Promise
 */
export default async function unit(context, input) {
  const { collections } = context;
  const { Units } = collections;
  const { unitId, shopId } = input;

  // await context.validatePermissions(`reaction:legacy:units:${unitId}`, "read", {
  //   shopId,
  // });

  return Units.findOne({
    _id: unitId,
    shopId,
  });
}
