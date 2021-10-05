import { decodeDoorOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 *
 * @method cloneDoorVariants
 * @summary Takes an array of door variant IDs and clones variants
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - mutation input object
 * @param {String} args.input.clientMutationId - The mutation id
 * @param {String[]} args.input.variantIds - an array of variant IDs to clone
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} cloneDoorVariants payload
 */
export default async function cloneDoorVariants(_, { input }, context) {
  const { clientMutationId, shopId, variantIds } = input;

  const decodedVariantIds = variantIds.map((variantId) =>
    decodeDoorOpaqueId(variantId)
  );

  const clonedVariants = await context.mutations.cloneDoorVariants(context, {
    shopId: decodeShopOpaqueId(shopId),
    variantIds: decodedVariantIds,
  });

  return {
    clientMutationId,
    variants: clonedVariants,
  };
}
