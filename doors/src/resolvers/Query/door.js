import { decodeDoorOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Query/door
 * @method
 * @memberof Door/Query
 * @summary query the Doors collection for a single door
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.doorId - Door id
 * @param {String} args.shopId - Shop id of the door
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} Doors
 */
export default async function door(_, args, context) {
  const { doorId: opaqueDoorId, shopId: opaqueShopId, size, type } = args;

  const doorId = decodeDoorOpaqueId(opaqueDoorId);
  const shopId = decodeShopOpaqueId(opaqueShopId);

  console.log("I am in the /resolver/Query/door.js file");

  console.log(`size`, size);

  return context.queries.door(context, {
    doorId,
    shopId,
    size,
    type,
  });
}
