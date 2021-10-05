import { decodeUnitOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 *
 * @method archiveUnitVariants
 * @summary Takes an array of variant IDs and archives variants
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - mutation input object
 * @param {String} args.input.shopId - shop these variants belong to
 * @param {String} args.input.variantIds - an array of variant IDs to archive
 * @param {Object} context - an object containing the per-request state
 * @return {Array} array with archived variants
 */
export default async function archiveUnitVariants(_, { input }, context) {
  const { clientMutationId, shopId, variantIds } = input;

  const decodedVariantIds = variantIds.map((variantId) =>
    decodeUnitOpaqueId(variantId)
  );

  // This `archiveUnitVariants` resolver calls the `archiveUnits` mutation
  // as we don't have the need to separate this into `archiveUnitVariants` at this time.
  // In the future, we can create a `archiveUnitVariants` mutation if needed.
  const archivedVariants = await context.mutations.archiveUnits(context, {
    unitIds: decodedVariantIds,
    shopId: decodeShopOpaqueId(shopId),
  });

  return {
    clientMutationId,
    variants: archivedVariants,
  };
}
