import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import cleanUnitInput from "../utils/cleanUnitInput.js";

const inputSchema = new SimpleSchema({
  unit: {
    type: Object,
    blackbox: true,
    optional: true,
  },
  unitId: String,
  shopId: String,
});

/**
 * @method updateUnit
 * @summary Updates a unit
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - Input arguments for the bulk operation
 * @param {String} input.field - unit field to update
 * @param {String} input.unitId - unitId of unit to update
 * @param {String} input.shopId - shopId of shop unit belongs to
 * @param {String} input.value - value to update field with
 * @return {Promise<Object>} updateUnit payload
 */
export default async function updateUnit(context, input) {
  inputSchema.validate(input);

  const { appEvents, collections, simpleSchemas } = context;
  const { Unit } = simpleSchemas;
  const { Units } = collections;
  const { unit: unitInput, unitId, shopId } = input;

  // Check that user has permission to create unit
  await context.validatePermissions(
    `reaction:legacy:units:${unitId}`,
    "update",
    { shopId }
  );

  const currentUnit = await Units.findOne({ _id: unitId, shopId });
  if (!currentUnit) throw new ReactionError("not-found", "Unit not found");

  const updateDocument = await cleanUnitInput(context, {
    currentUnitHandle: currentUnit.handle,
    unitId,
    unitInput,
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

  Unit.validate(modifier, { modifier: true });

  const { value: updatedUnit } = await Units.findOneAndUpdate(
    {
      _id: unitId,
      shopId,
    },
    modifier,
    {
      returnOriginal: false,
    }
  );

  await appEvents.emit("afterUnitUpdate", { unitId, unit: updatedUnit });

  return updatedUnit;
}
