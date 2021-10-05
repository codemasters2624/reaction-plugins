import { decodeUnitOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Query/unit
 * @method
 * @memberof Unit/Query
 * @summary query the Units collection for a single unit
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.unitId - Unit id
 * @param {String} args.shopId - Shop id of the unit
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} Units
 */
export default async function unit(_, args, context) {
  const { unitId: opaqueUnitId, shopId: opaqueShopId } = args;

  const unitId = decodeUnitOpaqueId(opaqueUnitId);
  const shopId = decodeShopOpaqueId(opaqueShopId);

  return context.queries.unit(context, {
    unitId,
    shopId,
  });
}
