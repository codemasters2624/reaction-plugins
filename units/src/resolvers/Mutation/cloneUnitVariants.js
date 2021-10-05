import { decodeUnitOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 *
 * @method cloneUnitVariants
 * @summary Takes an array of unit variant IDs and clones variants
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - mutation input object
 * @param {String} args.input.clientMutationId - The mutation id
 * @param {String[]} args.input.variantIds - an array of variant IDs to clone
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} cloneUnitVariants payload
 */
export default async function cloneUnitVariants(_, { input }, context) {
  const { clientMutationId, shopId, variantIds } = input;

  const decodedVariantIds = variantIds.map((variantId) =>
    decodeUnitOpaqueId(variantId)
  );

  const clonedVariants = await context.mutations.cloneUnitVariants(context, {
    shopId: decodeShopOpaqueId(shopId),
    variantIds: decodedVariantIds,
  });

  return {
    clientMutationId,
    variants: clonedVariants,
  };
}
