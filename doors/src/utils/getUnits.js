//TODO Improve Code quality and Code execution. The code is spaghetti as of now but still does the job. Will Impact Scaling long time. (   Commented by Depressed Spiral ;)    )

/**
 *
 * @method getVariants
 * @summary Get all of a Door's Variants or only a Door's top level Variants.
 * @param {Object} context - an object containing the per-request state
 * @param {String} doorOrVariantId - A Door or top level Door Variant ID.
 * @param {Boolean} topOnly - True to return only a doors top level variants.
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {Boolean} args.shouldIncludeHidden - Include hidden doors in results
 * @param {Boolean} args.shouldIncludeArchived - Include archived doors in results
 * @returns {Promise<Object[]>} Array of Door Variant objects.
 */
export default async function getUnits(
  context,
  id,
  height,
  width,
  topOnly,
  args
) {
  const { shouldIncludeHidden, shouldIncludeArchived } = args;
  const { collections } = context;
  const { Units, Doors } = collections;

  const doorVariants = await Doors.find({
    //* Retrieve Doors Collection from the MongoDB
    type: "variant",
    ancestors: id,
  }).toArray();

  console.log("doorVariants", doorVariants);

  let doorSizeArr = doorVariants.map((key) => ({
    //* Extract Height and Width from Door Collection and push them in new Array
    height: key.height,
    width: key.width,
  }));

  doorSizeArr = doorSizeArr.map((key) => JSON.stringify(key)); // Stringified Height & Width Array for comaparison purposes
  /*
  * Node does not allow comparison of objects normally as Objects are referenced in memory hence causing issue. For that purpose, the obejcts
  *are stringified as strings can be compared with their values. Reference: https://stackoverflow.com/questions/12629981/testing-objects-equality-in-nodejs
   
  */
  console.log(`doorSizeArr`, doorSizeArr);

  let dbUnits = await Units.find({}).toArray(); //* Retrieve Units Collection from the MongoDB

  console.log(`dbUnits`, dbUnits);

  let unitsDoorVariants = dbUnits.map((key) => key.doorVariant); //* Destructure and store doorVariant field in specific array for simplification purposes

  console.log(`unitsDoorVariants`, unitsDoorVariants);

  let unitIndex = unitsDoorVariants.map((key) => {
    //* Same thing as above. What follows is stringifying the objects in the unitsDoorVariants array for comparison purposes. See reference above for further clarification.
    key = key.map((subKey) => (subKey = JSON.stringify(subKey)));
    console.log(key);
    return key.every((subkey) => doorSizeArr.includes(subkey)); //* If unitsDoorVariants is a subset of doorSizeArr. Push true in new array else push false
  });

  let unitIndices = [];

  let idx = unitIndex.indexOf(true); //* This convoluted piece of code is to seggregate the trues from the falses.
  while (idx != -1) {
    unitIndices.push(idx);
    idx = unitIndex.indexOf(true, idx + 1); //* This line here get the index number of the true value and push them into a new array
  }
  console.log(unitIndices);

  let selectedUnits = [];
  for (let x = 0; x < unitIndices.length; x++) {
    selectedUnits.push(dbUnits[unitIndices[x]]); //* This line create a new array where the subset units(Objects)(required ones) are pushed in an array for returning to GraphQL query.
  }

  console.log(`selectedUnits`, selectedUnits);

  /**
   ** Only include visible variants if `false`
   ** Otherwise both hidden and visible will be shown
   */
  // if (shouldIncludeHidden === false) {
  //   selector.isVisible = true;
  // }

  //* Exclude archived (deleted) variants if set to `false`
  //* Otherwise include archived variants in the results
  // if (shouldIncludeArchived === false) {
  //   selector.isDeleted = {
  //     $ne: true,
  //   };
  // }

  return selectedUnits;
}
