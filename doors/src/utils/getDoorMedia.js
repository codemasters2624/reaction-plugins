/**
 *
 * @method getDoorMedia
 * @summary Get an array of ImageInfo objects by Door ID
 * @param {Object} door -  A door of type simple
 * @param {Boolean} shouldIncludeVariantMedia - Whether to return variant media or not
 * @param {Object} context - The per request context
 * @returns {Promise<Object[]>} Array of ImageInfo objects sorted by priority
 */
export default async function getDoorMedia(
  door,
  { shouldIncludeVariantMedia = true },
  context
) {
  const { Media } = context.collections;
  const { _id: doorId, shopId } = door;

  if (!Media) return [];

  let includeVariantMedia = {};
  if (!shouldIncludeVariantMedia) {
    includeVariantMedia = { "metadata.variantId": null };
  }

  const mediaArray = await Media.find(
    {
      "metadata.shopId": shopId,
      "metadata.doorId": doorId,
      ...includeVariantMedia,
      "metadata.workflow": { $nin: ["archived", "unpublished"] },
    },
    {
      sort: { "metadata.priority": 1, uploadedAt: 1 },
    }
  );

  // Denormalize media
  const doorMedia = mediaArray
    .map((media) => {
      const { metadata } = media;
      const { priority, doorId: prodId, variantId } = metadata || {};

      return {
        _id: media._id,
        priority,
        doorId: prodId,
        variantId,
        URLs: {
          large: `${media.url({ store: "large" })}`,
          medium: `${media.url({ store: "medium" })}`,
          original: `${media.url({ store: "image" })}`,
          small: `${media.url({ store: "small" })}`,
          thumbnail: `${media.url({ store: "thumbnail" })}`,
        },
      };
    })
    .sort((mediaA, mediaB) => mediaA.priority - mediaB.priority);

  return doorMedia;
}
