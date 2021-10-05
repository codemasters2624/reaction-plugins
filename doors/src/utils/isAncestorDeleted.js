/**
 * @method isAncestorDeleted
 * @summary Verify there are no deleted ancestors
 * Variants cannot be created / restored if their parent door / variant is deleted
 * @param {Object} context - an object containing the per-request state
 * @param  {Object} door - the door object to check for ancestors
 * @param  {Boolean} includeSelf include supplied door
 * @returns {Boolean} true or false
 */
export default async function isAncestorDeleted(context, door, includeSelf) {
  const { collections } = context;
  const { Doors } = collections;

  const doorIds = [
    ...door.ancestors, // Avoid mutations
  ];

  if (includeSelf) {
    doorIds.push(door._id);
  }

  // Verify there are no deleted ancestors
  // Variants cannot be created / restored if their parent door / variant is deleted
  const archivedCount = await Doors.find({
    _id: { $in: doorIds },
    isDeleted: true,
  }).count();

  if (archivedCount > 0) {
    return true;
  }

  return false;
}
