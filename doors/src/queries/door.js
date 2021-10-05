// /**
//  * @name door
//  * @method
//  * @memberof GraphQL/Door
//  * @summary Query the Doors collection for a single door
//  * @param {Object} context - an object containing the per-request state
//  * @param {Object} input - Request input
//  * @param {String} input.doorId - Door ID
//  * @param {String} input.shopId - Shop ID
//  * @returns {Promise<Object>} Door object Promise
//  */
// export default async function door(context, input) {
//   const { collections } = context;
//   const { Doors, Doors } = collections;
//   const { doorId, size, shopId } = input;
//   const { height, width } = size;

//   // await context.validatePermissions(`reaction:legacy:doors:${doorId}`, "read", {
//   //   shopId,
//   // });

//   console.log(`size`, size);

//   size.map((key) => {
//     console.log(key);
//     console.log(key.height);
//     console.log(key.width);
//   });
//   let foundDoors = await Promise.all(
//     size.map((key) => {
//       console.log(`key.height`, key.height);
//       console.log(`key.width`, key.width);

//       return Doors.aggregate([
//         { $unwind: "$doorVariant" },
//         {
//           $match: {
//             "doorVariant.height": { $eq: key.height },
//             "doorVariant.width": { $eq: key.width },
//           },
//         },
//       ]).toArray();
//     })
//   );

//   foundDoors = foundDoors.flat();
//   let foundDoors = Doors.find({
//     height
//   })
//   console.log(`foundDoors`, foundDoors);

//   if (doorId) {
//     console.log(`doorId`, doorId);
//     console.log("Inside If");
//     return Doors.find({
//       _id: doorId,
//       shopId,
//     }).toArray();
//   } else {
//     console.log("Inside else");
//     return Doors.find({
//       _id: doorId,
//       shopId,
//     }).toArray();
//   }
// }

/**
 * @name door
 * @method
 * @memberof GraphQL/Door * @summary Query the Doors collection for a single door
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Request input
 * @param {String} input.doorId - Door ID
 * @param {String} input.shopId - Shop ID
 * @returns {Promise<Object>} Door object Promise
 */
export default async function door(context, input) {
  const { collections } = context;
  const { Doors } = collections;
  const { doorId, shopId, size, type } = input;

  console.log(`type`, type);

  if (type == "variant") {
    if (size.height == undefined || size.width == undefined) {
      throw new Error("Height or Width is not given.");
    }
    const { height, width } = size;
    // await context.validatePermissions(`reaction:legacy:doors:${doorId}`, "read", {
    //   shopId,
    // });

    console.log("I am in the /queries/door.js file");
    console.log("size in the /queries/door.js file", size);

    console.log(`height, width`, height, width);

    let doorFound = await Doors.find({
      height: height,
      width: width,
      type: "variant",
    }).toArray();

    console.log(`doorFound`, doorFound);

    // return Doors.find({
    //   _id: doorId,
    //   shopId,
    // }).toArray();
    return Doors.find({
      height: height,
      width: width,
      type: "variant",
      shopId,
    }).toArray();
  } else {
    console.log(`inside Else`);
    return Doors.find({
      _id: doorId,
      shopId,
    }).toArray();
  }
}
