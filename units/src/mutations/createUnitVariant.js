import SimpleSchema from "simpl-schema";
import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import cleanUnitVariantInput from "../utils/cleanUnitVariantInput.js";
import isAncestorDeleted from "../utils/isAncestorDeleted.js";

/**
 * @method createUnitVariant
 * @summary creates an empty variant on the unit supplied
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Input arguments for the bulk operation
 * @param {String} input.unitId - the unit or variant ID which we create new variant on
 * @param {String} input.shopId - the shop to create the variant for
 * @param {Object} [input.variant] - variant data
 * @return {String} created variantId
 */
export default async function createUnitVariant(context, input) {
  const { collections } = context;
  const { Units } = collections;
  const { unitId, shopId, variant: unitVariantInput } = input;

  // See that user has permission to create variant
  // await context.validatePermissions("reaction:legacy:units", "create", { shopId });

  // See that parent unit exists
  const parentUnit = await Units.findOne({ _id: unitId, shopId });
  if (!parentUnit) {
    throw new ReactionError("not-found", "Unit not found");
  }

  let unit;
  let parentVariant;
  if (parentUnit.type === "variant") {
    unit = await Units.findOne({
      _id: parentUnit.ancestors[0],
      shopId,
    });
    parentVariant = parentUnit;
  } else {
    unit = parentUnit;
    parentVariant = null;
  }

  // Verify that parent is not deleted
  // Variants cannot be created on a deleted unit
  if (await isAncestorDeleted(context, unit, true)) {
    throw new ReactionError(
      "server-error",
      "Unable to create unit variant on a deleted unit"
    );
  }

  // get ancestors to build new ancestors array
  let { ancestors } = parentUnit;
  if (Array.isArray(ancestors)) {
    ancestors.push(unitId);
  } else {
    ancestors = [unitId];
  }

  const initialUnitVariantData = await cleanUnitVariantInput(context, {
    unitVariantInput,
  });

  if (initialUnitVariantData.isDeleted) {
    throw new ReactionError(
      "invalid-param",
      "Creating a deleted unit variant is not allowed"
    );
  }

  // Generate a random ID, but only if one was not passed in
  const newVariantId =
    (unitVariantInput && unitVariantInput._id) || Random.id();

  const createdAt = new Date();
  const newVariant = {
    _id: newVariantId,
    ancestors,
    createdAt,
    isDeleted: false,
    isVisible: false,
    shopId,
    type: "variant",
    updatedAt: createdAt,
    workflow: {
      status: "new",
    },
    ...initialUnitVariantData,
  };

  const isOption = ancestors.length > 1;

  // Apply custom transformations from plugins.
  for (const customFunc of context.getFunctionsOfType(
    "mutateNewVariantBeforeCreate"
  )) {
    // Functions of type "mutateNewVariantBeforeCreate" are expected to mutate the provided variant.
    // We need to run each of these functions in a series, rather than in parallel, because
    // we are mutating the same object on each pass.
    // eslint-disable-next-line no-await-in-loop
    await customFunc(newVariant, { context, isOption, parentVariant, unit });
  }

  await Units.insertOne(newVariant);

  Logger.debug(
    `createUnitVariant: created variant: ${newVariantId} for ${unitId}`
  );

  return newVariant;
}
