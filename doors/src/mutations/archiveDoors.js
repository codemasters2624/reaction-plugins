import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";

const inputSchema = new SimpleSchema({
  doorIds: Array,
  "doorIds.$": {
    type: String,
  },
  shopId: String,
});

/**
 *
 * @method archiveDoors
 * @summary archives a door
 * @description the method archives doors, but will also archive
 * child variants and options
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - Input arguments for the bulk operation
 * @param {String} input.doorIds - an array of decoded door IDs to archive
 * @param {String} input.shopId - shop these doors belong to
 * @return {Array} array with archived doors
 */
export default async function archiveDoors(context, input) {
  inputSchema.validate(input);
  const { appEvents, collections, userId } = context;
  const { Doors } = collections;
  const { doorIds, shopId } = input;

  // TODO(pod-auth): create helper to handle multiple permissions checks for multiple items
  for (const doorId of doorIds) {
    // eslint-disable-next-line no-await-in-loop
    await context.validatePermissions(
      `reaction:legacy:doors:${doorId}`,
      "archive",
      { shopId }
    );
  }

  // Check to make sure all doors are on the same shop
  const count = await Doors.find({ _id: { $in: doorIds }, shopId }).count();
  if (count !== doorIds.length)
    throw new ReactionError("not-found", "One or more doors do not exist");

  // Find all doors that aren't deleted, and all their variants variants
  const doorsWithVariants = await Doors.find({
    // Don't "archive" doors that are already marked deleted.
    isDeleted: {
      $ne: true,
    },
    $or: [
      {
        _id: {
          $in: doorIds,
        },
      },
      {
        ancestors: {
          $in: doorIds,
        },
      },
    ],
  }).toArray();

  // Get ID's of all doors to archive
  const doorIdsToArchive = doorsWithVariants.map((door) => door._id);

  const archivedDoors = await Promise.all(
    doorIdsToArchive.map(async (doorId) => {
      const { value: archivedDoor } = await Doors.findOneAndUpdate(
        {
          _id: doorId,
        },
        {
          $set: {
            isDeleted: true,
          },
        },
        {
          returnOriginal: false,
        }
      );

      if (archivedDoor.type === "variant") {
        appEvents.emit("afterVariantSoftDelete", {
          variant: {
            ...archivedDoor,
          },
          deletedBy: userId,
        });
      } else {
        appEvents.emit("afterDoorSoftDelete", {
          door: {
            ...archivedDoor,
          },
          deletedBy: userId,
        });
      }
      return archivedDoor;
    })
  );

  // Return only originally supplied door(s),
  // not variants and options also archived
  return archivedDoors.filter((archivedDoor) =>
    doorIds.includes(archivedDoor._id)
  );
}
