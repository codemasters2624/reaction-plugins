import { encodeTagOpaqueId } from "../../xforms/id.js";

/**
 * @name Unit/tagIds
 * @method
 * @memberof Unit/GraphQL
 * @summary Returns the unit tagIds prop to opaque IDs
 * @param {Object} unit - Unit response from parent resolver
 * @returns {String[]} Array of tag IDs
 */
export default function tagsIds(unit) {
  const { hashtags } = unit;
  if (!hashtags || hashtags.length === 0) return [];

  return hashtags.map(encodeTagOpaqueId);
}
