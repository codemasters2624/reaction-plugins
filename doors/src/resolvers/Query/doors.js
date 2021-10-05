import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";
import {
  decodeDoorOpaqueId,
  decodeShopOpaqueId,
  decodeTagOpaqueId,
} from "../../xforms/id.js";

/**
 * @name Query/doors
 * @method
 * @memberof Doors/Query
 * @summary Query for a list of doors
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.shopId - id of user to query
 * @param {Object} context - an object containing the per-request state
 * @param {Object} info Info about the GraphQL request
 * @returns {Promise<Object>} Doors
 */
export default async function doors(_, args, context, info) {
  const {
    doorIds: opaqueDoorIds,
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
  const doorIds = opaqueDoorIds && opaqueDoorIds.map(decodeDoorOpaqueId);
  const tagIds = opaqueTagIds && opaqueTagIds.map(decodeTagOpaqueId);

  const query = await context.queries.doors(context, {
    doorIds,
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
