/**
 *
 * @method getVariants
 * @summary Get all of a Door's Variants or only a Door's top level Variants.
 * @param {Object} context - an object containing the per-request state
 * @param {String} doorOrVariantId - A Door or top level Door Variant ID.
 * @param {Boolean} topOnly - True to return only a doors top level variants.
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {Boolean} args.shouldIncludeHidden - Include hidden doors in results
 * @param {Boolean} args.shouldIncludeArchived - Include archived doors in results
 * @returns {Promise<Object[]>} Array of Door Variant objects.
 */
export default async function getVariants(
  context,
  doorOrVariantId,
  topOnly,
  args
) {
  const { shouldIncludeHidden, shouldIncludeArchived } = args;
  const { collections } = context;
  const { Doors } = collections;

  const selector = {
    ancestors: topOnly ? [doorOrVariantId] : doorOrVariantId,
    type: "variant",
  };

  // Only include visible variants if `false`
  // Otherwise both hidden and visible will be shown
  if (shouldIncludeHidden === false) {
    selector.isVisible = true;
  }

  // Exclude archived (deleted) variants if set to `false`
  // Otherwise include archived variants in the results
  if (shouldIncludeArchived === false) {
    selector.isDeleted = {
      $ne: true,
    };
  }

  return Doors.find(selector).toArray();
}
