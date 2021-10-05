import { decodeDoorOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 *
 * @method createDoorVariant
 * @summary initializes empty variant template
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - mutation input object
 * @param {String} args.input.clientMutationId - The mutation id
 * @param {String[]} args.input.doorId - the door or variant ID which we create new variant on
 * @param {String[]} args.input.shopId - the shop to create the variant for
 * @param {Object} [args.input.variant] - variant data
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} createDoorVariant payload
 */
export default async function createDoorVariant(_, { input }, context) {
  const {
    clientMutationId = null,
    doorId,
    shopId,
    variant: variantInput,
  } = input;

  const variant = await context.mutations.createDoorVariant(context, {
    doorId: decodeDoorOpaqueId(doorId),
    shopId: decodeShopOpaqueId(shopId),
    variant: variantInput,
  });

  return {
    clientMutationId,
    variant,
  };
}
