import SimpleSchema from "simpl-schema";
import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import cleanDoorVariantInput from "../utils/cleanDoorVariantInput.js";
import isAncestorDeleted from "../utils/isAncestorDeleted.js";

/**
 * @method createDoorVariant
 * @summary creates an empty variant on the door supplied
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Input arguments for the bulk operation
 * @param {String} input.doorId - the door or variant ID which we create new variant on
 * @param {String} input.shopId - the shop to create the variant for
 * @param {Object} [input.variant] - variant data
 * @return {String} created variantId
 */
export default async function createDoorVariant(context, input) {
  const { collections } = context;
  const { Doors, Units } = collections;
  const { doorId, shopId, variant: doorVariantInput } = input;
  const { height, width } = doorVariantInput;

  // See that user has permission to create variant
  // await context.validatePermissions("reaction:legacy:doors", "create", { shopId });

  // db.Units.aggregate( [
  //   { $unwind : "$doorVariant" }, {$match: {"doorVariant.height": {$gte : 500}
  //       }
  //           }
  //   ] )

  // See that parent door exists
  const parentDoor = await Doors.findOne({ _id: doorId, shopId });
  if (!parentDoor) {
    throw new ReactionError("not-found", "Door not found");
  }

  console.log(`height, width`, height, width);

  let units = await Units.aggregate([
    { $unwind: "$doorVariant" },
    {
      $match: {
        "doorVariant.height": { $eq: height },
        "doorVariant.width": { $eq: width },
      },
    },
  ]).toArray();

  console.log(`units`, units);

  let door;
  let parentVariant;
  if (parentDoor.type === "variant") {
    door = await Doors.findOne({
      _id: parentDoor.ancestors[0],
      shopId,
    });
    parentVariant = parentDoor;
  } else {
    door = parentDoor;
    parentVariant = null;
  }

  // Verify that parent is not deleted
  // Variants cannot be created on a deleted door
  if (await isAncestorDeleted(context, door, true)) {
    throw new ReactionError(
      "server-error",
      "Unable to create door variant on a deleted door"
    );
  }

  // get ancestors to build new ancestors array
  let { ancestors } = parentDoor;
  if (Array.isArray(ancestors)) {
    ancestors.push(doorId);
  } else {
    ancestors = [doorId];
  }

  const initialDoorVariantData = await cleanDoorVariantInput(context, {
    doorVariantInput,
  });

  if (initialDoorVariantData.isDeleted) {
    throw new ReactionError(
      "invalid-param",
      "Creating a deleted door variant is not allowed"
    );
  }

  // Generate a random ID, but only if one was not passed in
  const newVariantId =
    (doorVariantInput && doorVariantInput._id) || Random.id();

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
    ...initialDoorVariantData,
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
    await customFunc(newVariant, { context, isOption, parentVariant, door });
  }

  await Doors.insertOne(newVariant);

  Logger.debug(
    `createDoorVariant: created variant: ${newVariantId} for ${doorId}`
  );

  return newVariant;
}
