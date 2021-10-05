import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import cleanDoorInput from "../utils/cleanDoorInput.js";

/**
 * @method createDoor
 * @summary creates an empty door, with an empty variant
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Input arguments for the operation
 * @param {String} [input.door] - door data
 * @param {Boolean} [input.shouldCreateFirstVariant=true] - Auto-create one variant for the door
 * @param {String} input.shopId - the shop to create the door for
 * @return {String} created doorId
 */

export default async function createDoor(context, input) {
  const { appEvents, collections } = context;
  const { Doors } = collections;
  const { door: doorInput, shopId, shouldCreateFirstVariant = true } = input;

  // Check that user has permission to create door
  // await context.validatePermissions("reaction:legacy:doors", "create", {
  //   shopId,
  // });

  const newDoorId = (doorInput && doorInput._id) || Random.id();

  const initialDoorData = await cleanDoorInput(context, {
    doorId: newDoorId,
    doorInput,
    shopId,
  });

  // if (initialDoorData.isDeleted) {
  //   throw new ReactionError(
  //     "invalid-param",
  //     "Creating a deleted door is not allowed"
  //   );
  // }

  const createdAt = new Date();
  const newDoor = {
    _id: newDoorId,
    ancestors: [],
    createdAt,
    handle: "",
    isDeleted: false,
    isVisible: false,
    shopId,
    shouldAppearInSitemap: true,
    supportedFulfillmentTypes: ["shipping"],
    title: "",
    type: "simple",
    updatedAt: createdAt,
    workflow: {
      status: "new",
    },
    ...initialDoorData,
  };

  // Apply custom transformations from plugins.
  // for (const customFunc of context.getFunctionsOfType("mutateNewDoorBeforeCreate")) {
  //   // Functions of type "mutateNewDoorBeforeCreate" are expected to mutate the provided variant.
  //   // We need to run each of these functions in a series, rather than in parallel, because
  //   // we are mutating the same object on each pass.
  //   // eslint-disable-next-line no-await-in-loop
  //   await customFunc(newDoor, { context });
  // }

  await Doors.insertOne(newDoor);

  // Create one initial door variant for it
  if (shouldCreateFirstVariant) {
    await context.mutations.createDoorVariant(context.getInternalContext(), {
      doorId: newDoorId,
      shopId,
    });
  }

  await appEvents.emit("afterDoorCreate", { door: newDoor });

  return newDoor;
}
