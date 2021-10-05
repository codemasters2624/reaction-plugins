import { encodeTagOpaqueId } from "../../xforms/id.js";

/**
 * @name Door/tagIds
 * @method
 * @memberof Door/GraphQL
 * @summary Returns the door tagIds prop to opaque IDs
 * @param {Object} door - Door response from parent resolver
 * @returns {String[]} Array of tag IDs
 */
export default function tagsIds(door) {
  const { hashtags } = door;
  if (!hashtags || hashtags.length === 0) return [];

  return hashtags.map(encodeTagOpaqueId);
}
