import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";
import {
  decodeUnitOpaqueId,
  decodeShopOpaqueId,
  decodeTagOpaqueId,
} from "../../xforms/id.js";

/**
 * @name Query/units
 * @method
 * @memberof Units/Query
 * @summary Query for a list of units
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.shopId - id of user to query
 * @param {Object} context - an object containing the per-request state
 * @param {Object} info Info about the GraphQL request
 * @returns {Promise<Object>} Units
 */
export default async function units(_, args, context, info) {
  const {
    unitIds: opaqueUnitIds,
    shopIds: opaqueShopIds,
    tagIds: opaqueTagIds,
    query: queryString,
    isArchived,
    isVisible,
    metafieldKey,
    metafieldValue,
    priceMin,
    priceMax,
    ...connectionArgs
  } = args;

  const shopIds = opaqueShopIds.map(decodeShopOpaqueId);
  const unitIds = opaqueUnitIds && opaqueUnitIds.map(decodeUnitOpaqueId);
  const tagIds = opaqueTagIds && opaqueTagIds.map(decodeTagOpaqueId);

  const query = await context.queries.units(context, {
    unitIds,
    shopIds,
    tagIds,
    query: queryString,
    isArchived,
    isVisible,
    metafieldKey,
    metafieldValue,
    priceMin,
    priceMax,
  });

  return getPaginatedResponse(query, connectionArgs, {
    includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
    includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
    includeTotalCount: wasFieldRequested("totalCount", info),
  });
}
