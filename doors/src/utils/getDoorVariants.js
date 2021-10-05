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
  doorVariantId,
  topOnly,
  args
) {
  const { shouldIncludeHidden, shouldIncludeArchived } = args;
  const { collections } = context;
  const { Doors } = collections;

  console.log("Doors", Doors);
  console.log(`doorOrVariantId`, doorOrVariantId);
  console.log("doorVariantId", doorVariantId);

  const selector = {
    ancestors: topOnly ? [doorVariantId] : doorVariantId,
    type: "variant",
  };

  // Only include visible variants if `false`
  // Otherwise both hidden and visible will be shown
  if (shouldIncludeHidden === false) {
    selector.isVisible = true;
  }

  console.log(`_id: ${doorVariantId}`);

  let doorFound = await Doors.find({ _id: doorVariantId }).toArray();
  console.log("DoorFinder", doorFound);
  // Exclude archived (deleted) variants if set to `false`
  // Otherwise include archived variants in the results
  if (shouldIncludeArchived === false) {
    selector.isDeleted = {
      $ne: true,
    };
  }

  return doorFound;
}
