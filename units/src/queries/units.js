import Unit from "../resolvers/Unit/index.js";
import applyUnitFilters from "../utils/applyUnitFilters.js";

/**
 * @name units
 * @method
 * @memberof GraphQL/Units
 * @summary Query the Units collection for a list of units
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Request input
 * @param {Boolean} [isArchived] - Filter by archived
 * @param {Boolean} [isVisible] - Filter by visibility
 * @param {String} [metafieldKey] - Filter by metafield key
 * @param {String} [metafieldValue] - Filter by metafield value
 * @param {Number} [priceMax] - Filter by price range maximum value
 * @param {Number} [priceMin] - Filter by price range minimum value
 * @param {String[]} [unitIds] - List of unit IDs to filter by
 * @param {String} [query] - Regex match query string
 * @param {String[]} shopIds - List of shop IDs to filter by
 * @param {String[]} [tagIds] - List of tag ids to filter by
 * @returns {Promise<Object>} Units object Promise
 */
export default async function units(context, input) {
  const { collections } = context;
  const { Units } = collections;
  const unitFilters = input;

  // Check the permissions for all shops requested
  await Promise.all(
    unitFilters.shopIds.map(async (shopId) => {
      // await context.validatePermissions("reaction:legacy:units", "read", {
      //   shopId,
      // });
    })
  );

  // Create the mongo selector from the filters
  const selector = applyUnitFilters(context, unitFilters);

  // Get the first N (limit) top-level units that match the query
  return Units.find(selector);
}
