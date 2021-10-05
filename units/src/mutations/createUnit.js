import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import cleanUnitInput from "../utils/cleanUnitInput.js";
import { decodeDoorOpaqueId } from "../xforms/id.js";

/**
 * @method createUnit
 * @summary creates an empty unit, with an empty variant
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Input arguments for the operation
 * @param {String} [input.unit] - unit data
 * @param {Boolean} [input.shouldCreateFirstVariant=true] - Auto-create one variant for the unit
 * @param {String} input.shopId - the shop to create the unit for
 * @return {String} created unitId
 */
export default async function createUnit(context, input) {
  const { appEvents, collections } = context;
  const { Units, Doors } = collections;
  const { unit: unitInput, shopId, shouldCreateFirstVariant = true } = input;
  let { numberOfDoors, doorVariant } = unitInput;

  // Check that user has permission to create unit
  // await context.validatePermissions("reaction:legacy:units", "create", {
  //   shopId,
  // });

  let heights = []; // Declare array to store sizes of Doors

  if (numberOfDoors == undefined) numberOfDoors = 0; //Handling edge case if numberOfDoors is not declared.

  if (
    doorVariant.length > numberOfDoors ||
    doorVariant.length < numberOfDoors
  ) {
    throw new Error(
      "Number of sizes cannot be greater or lesser than Number of Doors attached." //Second Edge case handled if sizes provided are more than doors attached
    );
  }

  console.log(doorVariant.length, numberOfDoors); //TODO Remove this console

  heights.push(
    doorVariant.map((key) => {
      return { height: key.height, width: key.width }; //Loop to push doorVariant array into height array to query from the Doors Collection in MongoDB.
    })
  );

  heights = heights.flat(); // TODO Flatten the array to Single array from an array of array of objects. (If it sounds convoluted, it probably is and should be refactored ASAP)

  console.log(`heights`, heights); //TODO Remove this console

  let variants = [];

  let heightsPromises = heights.map(async (key) => {
    console.log("key", key);
    let temp = await Doors.find({
      height: key.height,
      width: key.width,
    }).toArray();
    console.log(`temp`, temp);
    if (temp == [] || temp == "")
      throw new Error(
        `Door Variant with height ${key.height} or width ${key.width} not found`
      );
    return temp;
  });

  const data = await Promise.all(heightsPromises);
  variants.push(data);
  variants = variants.flat(3);
  variants.map((key) => console.log("second key", key)); //TODO Remove this console

  const newUnitId = (unitInput && unitInput._id) || Random.id();

  const initialUnitData = await cleanUnitInput(context, {
    unitId: newUnitId,
    unitInput,
    shopId,
  });

  // if (initialUnitData.isDeleted) {
  //   throw new ReactionError(
  //     "invalid-param",
  //     "Creating a deleted unit is not allowed"
  //   );
  // }

  const createdAt = new Date();
  const newUnit = {
    _id: newUnitId,
    ancestors: [],
    createdAt,
    handle: "",
    numberOfDoors: 0,
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
    ...initialUnitData,
  };

  // Apply custom transformations from plugins.
  // for (const customFunc of context.getFunctionsOfType("mutateNewUnitBeforeCreate")) {
  // Functions of type "mutateNewUnitBeforeCreate" are expected to mutate the provided variant.
  // We need to run each of these functions in a series, rather than in parallel, because
  // we are mutating the same object on each pass.
  // eslint-disable-next-line no-await-in-loop
  //   await customFunc(newUnit, { context });
  // }

  await Units.insertOne(newUnit);

  // Create one initial unit variant for it
  if (shouldCreateFirstVariant) {
    await context.mutations.createUnitVariant(context.getInternalContext(), {
      unitId: newUnitId,
      shopId,
    });
  }

  await appEvents.emit("afterUnitCreate", { unit: newUnit });

  return newUnit;
}
