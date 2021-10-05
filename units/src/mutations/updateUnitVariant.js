import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import cleanUnitVariantInput from "../utils/cleanUnitVariantInput.js";

const inputSchema = new SimpleSchema({
  shopId: String,
  variant: {
    type: Object,
    blackbox: true,
  },
  variantId: String,
});

/**
 * @method updateUnitVariant
 * @summary Updates various fields on a unit variant
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - Input arguments for the bulk operation
 * @param {Object} input.variant - updated variant fields
 * @param {String} input.variantId - variantId of unit to update
 * @param {String} input.shopId - shopId of shop unit belongs to
 * @return {Promise<Object>} updated UnitVariant
 */
export default async function updateUnitVariant(context, input) {
  inputSchema.validate(input);
  const { appEvents, collections, simpleSchemas } = context;
  const { UnitVariant } = simpleSchemas;
  const { Units } = collections;
  const { variant: unitVariantInput, variantId, shopId } = input;

  // Check that user has permission to create unit
  await context.validatePermissions(
    `reaction:legacy:units:${variantId}`,
    "update",
    { shopId }
  );

  const updateDocument = await cleanUnitVariantInput(context, {
    unitVariantInput,
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

  UnitVariant.validate(modifier, { modifier: true });

  const { value: updatedUnitVariant } = await Units.findOneAndUpdate(
    {
      _id: variantId,
      shopId,
    },
    modifier,
    {
      returnOriginal: false,
    }
  );

  if (!updatedUnitVariant)
    throw new ReactionError("not-found", "Unit variant not found");

  await appEvents.emit("afterVariantUpdate", {
    fields,
    unitId: updatedUnitVariant.ancestors[0],
    unitVariant: updatedUnitVariant,
    unitVariantId: variantId,
  });

  return updatedUnitVariant;
}
