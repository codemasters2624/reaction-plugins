const variantFieldsThatShouldNotBeDirectlySet = [
  "_id",
  "ancestors",
  "createdAt",
  "shopId",
  "type",
  "updatedAt",
  "workflow",
];

/**
 * @summary Copies and cleans the DoorVariantInput object accepted by the
 *   createDoorVariant and updateDoorVariant mutations.
 * @param {Object} context App context
 * @param {Object} input Function input
 * @param {Object} input.doorVariantInput DoorVariantInput object to clean
 * @return {Promise<Object>} Cleaned DoorVariantInput
 */
export default async function cleanDoorVariantInput(
  context,
  { doorVariantInput }
) {
  const input = { ...doorVariantInput };

  // DoorVariant.validate call will ensure most validity, but there are certain fields
  // that we never want to allow arbitrary values for because they are controlled by the
  // system. We'll clear those here if someone is trying to set them.
  variantFieldsThatShouldNotBeDirectlySet.forEach((forbiddenField) => {
    delete input[forbiddenField];
  });

  return input;
}
