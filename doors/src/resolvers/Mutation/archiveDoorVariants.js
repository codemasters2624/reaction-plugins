import { decodeDoorOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 *
 * @method archiveDoorVariants
 * @summary Takes an array of variant IDs and archives variants
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - mutation input object
 * @param {String} args.input.shopId - shop these variants belong to
 * @param {String} args.input.variantIds - an array of variant IDs to archive
 * @param {Object} context - an object containing the per-request state
 * @return {Array} array with archived variants
 */
export default async function archiveDoorVariants(_, { input }, context) {
  const { clientMutationId, shopId, variantIds } = input;

  const decodedVariantIds = variantIds.map((variantId) =>
    decodeDoorOpaqueId(variantId)
  );

  // This `archiveDoorVariants` resolver calls the `archiveDoors` mutation
  // as we don't have the need to separate this into `archiveDoorVariants` at this time.
  // In the future, we can create a `archiveDoorVariants` mutation if needed.
  const archivedVariants = await context.mutations.archiveDoors(context, {
    doorIds: decodedVariantIds,
    shopId: decodeShopOpaqueId(shopId),
  });

  return {
    clientMutationId,
    variants: archivedVariants,
  };
}
