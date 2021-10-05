import getSlug from "@reactioncommerce/api-utils/getSlug.js";
import createHandle from "./createHandle.js";

const doorFieldsThatShouldNotBeDirectlySet = [
  "_id",
  "ancestors",
  "createdAt",
  "currentDoorHash",
  "parcel",
  "publishedAt",
  "publishedDoorHash",
  "shopId",
  "type",
  "workflow",
];

/**
 * @summary Copies and cleans the DoorInput object accepted by the
 *   createDoor and updateDoor mutations.
 * @param {Object} context App context
 * @param {Object} input Function input
 * @param {String} [input.currentDoorHandle] Current handle, if this is
 *   an update and there is one
 * @param {Object} input.doorId Door ID for use by `createHandle`
 * @param {Object} input.doorInput DoorInput object to clean
 * @param {Object} input.shopId Shop ID for use by `createHandle`
 * @return {Promise<Object>} Cleaned DoorInput
 */
export default async function cleanDoorInput(
  context,
  { currentDoorHandle, doorId, doorInput, shopId }
) {
  const input = { ...doorInput };

  // Slugify the handle input
  if (typeof input.slug === "string") {
    input.handle = await createHandle(
      context,
      getSlug(input.slug),
      doorId,
      shopId
    );
    delete input.slug;
  }

  // If a title is supplied, and the currently stored door doesn't have a handle,
  // then slugify the title and save it as the new handle (slug)
  if (typeof input.title === "string" && !currentDoorHandle && !input.handle) {
    input.handle = await createHandle(
      context,
      getSlug(input.title),
      doorId,
      shopId
    );
  }

  // Door.validate call will ensure most validity, but there are certain fields
  // that we never want to allow arbitrary values for because they are controlled by the
  // system. We'll clear those here if someone is trying to set them.
  doorFieldsThatShouldNotBeDirectlySet.forEach((forbiddenField) => {
    delete input[forbiddenField];
  });

  return input;
}
