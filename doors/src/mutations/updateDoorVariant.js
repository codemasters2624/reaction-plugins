import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import cleanDoorVariantInput from "../utils/cleanDoorVariantInput.js";

const inputSchema = new SimpleSchema({
  shopId: String,
  variant: {
    type: Object,
    blackbox: true,
  },
  variantId: String,
});

/**
 * @method updateDoorVariant
 * @summary Updates various fields on a door variant
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - Input arguments for the bulk operation
 * @param {Object} input.variant - updated variant fields
 * @param {String} input.variantId - variantId of door to update
 * @param {String} input.shopId - shopId of shop door belongs to
 * @return {Promise<Object>} updated DoorVariant
 */
export default async function updateDoorVariant(context, input) {
  inputSchema.validate(input);
  const { appEvents, collections, simpleSchemas } = context;
  const { DoorVariant } = simpleSchemas;
  const { Doors } = collections;
  const { variant: doorVariantInput, variantId, shopId } = input;

  // Check that user has permission to create door
  await context.validatePermissions(
    `reaction:legacy:doors:${variantId}`,
    "update",
    { shopId }
  );

  const updateDocument = await cleanDoorVariantInput(context, {
    doorVariantInput,
  });

  const fields = Object.keys(updateDocument);
  if (fields.length === 0) {
    throw new ReactionError(
      "invalid-param",
      "At least one field to update must be provided"
    );
  }

  updateDocument.updatedAt = new Date();

  const modifier = { $set: updateDocument };

  DoorVariant.validate(modifier, { modifier: true });

  const { value: updatedDoorVariant } = await Doors.findOneAndUpdate(
    {
      _id: variantId,
      shopId,
    },
    modifier,
    {
      returnOriginal: false,
    }
  );

  if (!updatedDoorVariant)
    throw new ReactionError("not-found", "Door variant not found");

  await appEvents.emit("afterVariantUpdate", {
    fields,
    doorId: updatedDoorVariant.ancestors[0],
    doorVariant: updatedDoorVariant,
    doorVariantId: variantId,
  });

  return updatedDoorVariant;
}
