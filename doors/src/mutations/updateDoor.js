import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import cleanDoorInput from "../utils/cleanDoorInput.js";

const inputSchema = new SimpleSchema({
  door: {
    type: Object,
    blackbox: true,
    optional: true,
  },
  doorId: String,
  shopId: String,
});

/**
 * @method updateDoor
 * @summary Updates a door
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - Input arguments for the bulk operation
 * @param {String} input.field - door field to update
 * @param {String} input.doorId - doorId of door to update
 * @param {String} input.shopId - shopId of shop door belongs to
 * @param {String} input.value - value to update field with
 * @return {Promise<Object>} updateDoor payload
 */
export default async function updateDoor(context, input) {
  inputSchema.validate(input);

  const { appEvents, collections, simpleSchemas } = context;
  const { Door } = simpleSchemas;
  const { Doors } = collections;
  const { door: doorInput, doorId, shopId } = input;

  // Check that user has permission to create door
  await context.validatePermissions(
    `reaction:legacy:doors:${doorId}`,
    "update",
    { shopId }
  );

  const currentDoor = await Doors.findOne({ _id: doorId, shopId });
  if (!currentDoor) throw new ReactionError("not-found", "Door not found");

  const updateDocument = await cleanDoorInput(context, {
    currentDoorHandle: currentDoor.handle,
    doorId,
    doorInput,
    shopId,
  });

  if (Object.keys(updateDocument).length === 0) {
    throw new ReactionError(
      "invalid-param",
      "At least one field to update must be provided"
    );
  }

  updateDocument.updatedAt = new Date();

  const modifier = { $set: updateDocument };

  Door.validate(modifier, { modifier: true });

  const { value: updatedDoor } = await Doors.findOneAndUpdate(
    {
      _id: doorId,
      shopId,
    },
    modifier,
    {
      returnOriginal: false,
    }
  );

  await appEvents.emit("afterDoorUpdate", { doorId, door: updatedDoor });

  return updatedDoor;
}
