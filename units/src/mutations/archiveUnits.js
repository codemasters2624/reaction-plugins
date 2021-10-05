import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";

const inputSchema = new SimpleSchema({
  unitIds: Array,
  "unitIds.$": {
    type: String,
  },
  shopId: String,
});

/**
 *
 * @method archiveUnits
 * @summary archives a unit
 * @description the method archives units, but will also archive
 * child variants and options
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - Input arguments for the bulk operation
 * @param {String} input.unitIds - an array of decoded unit IDs to archive
 * @param {String} input.shopId - shop these units belong to
 * @return {Array} array with archived units
 */
export default async function archiveUnits(context, input) {
  inputSchema.validate(input);
  const { appEvents, collections, userId } = context;
  const { Units } = collections;
  const { unitIds, shopId } = input;

  // TODO(pod-auth): create helper to handle multiple permissions checks for multiple items
  for (const unitId of unitIds) {
    // eslint-disable-next-line no-await-in-loop
    await context.validatePermissions(
      `reaction:legacy:units:${unitId}`,
      "archive",
      { shopId }
    );
  }

  // Check to make sure all units are on the same shop
  const count = await Units.find({ _id: { $in: unitIds }, shopId }).count();
  if (count !== unitIds.length)
    throw new ReactionError("not-found", "One or more units do not exist");

  // Find all units that aren't deleted, and all their variants variants
  const unitsWithVariants = await Units.find({
    // Don't "archive" units that are already marked deleted.
    isDeleted: {
      $ne: true,
    },
    $or: [
      {
        _id: {
          $in: unitIds,
        },
      },
      {
        ancestors: {
          $in: unitIds,
        },
      },
    ],
  }).toArray();

  // Get ID's of all units to archive
  const unitIdsToArchive = unitsWithVariants.map((unit) => unit._id);

  const archivedUnits = await Promise.all(
    unitIdsToArchive.map(async (unitId) => {
      const { value: archivedUnit } = await Units.findOneAndUpdate(
        {
          _id: unitId,
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

      if (archivedUnit.type === "variant") {
        appEvents.emit("afterVariantSoftDelete", {
          variant: {
            ...archivedUnit,
          },
          deletedBy: userId,
        });
      } else {
        appEvents.emit("afterUnitSoftDelete", {
          unit: {
            ...archivedUnit,
          },
          deletedBy: userId,
        });
      }
      return archivedUnit;
    })
  );

  // Return only originally supplied unit(s),
  // not variants and options also archived
  return archivedUnits.filter((archivedUnit) =>
    unitIds.includes(archivedUnit._id)
  );
}
