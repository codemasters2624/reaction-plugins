import Door from "../resolvers/Door/index.js";
import applyDoorFilters from "../utils/applyDoorFilters.js";

/**
 * @name doors
 * @method
 * @memberof GraphQL/Doors
 * @summary Query the Doors collection for a list of doors
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Request input
 * @param {Boolean} [isArchived] - Filter by archived
 * @param {Boolean} [isVisible] - Filter by visibility
 * @param {String} [metafieldKey] - Filter by metafield key
 * @param {String} [metafieldValue] - Filter by metafield value
 * @param {Number} [priceMax] - Filter by price range maximum value
 * @param {Number} [priceMin] - Filter by price range minimum value
 * @param {String[]} [doorIds] - List of door IDs to filter by
 * @param {String} [query] - Regex match query string
 * @param {String[]} shopIds - List of shop IDs to filter by
 * @param {String[]} [tagIds] - List of tag ids to filter by
 * @returns {Promise<Object>} Doors object Promise
 */
export default async function doorUnits(context, input) {
  const { collections } = context;
  const { Doors } = collections;
  const doorFilters = input;

  // Check the permissions for all shops requested
  await Promise.all(
    doorFilters.shopIds.map(async (shopId) => {
      // await context.validatePermissions("reaction:legacy:doors", "read", {
      //   shopId,
      // });
    })
  );

  // Create the mongo selector from the filters
  const selector = applyDoorFilters(context, doorFilters);

  // Get the first N (limit) top-level doors that match the query
  return Doors.find(selector);
}
