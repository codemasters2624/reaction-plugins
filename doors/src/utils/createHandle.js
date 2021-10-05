/**
 * @function createHandle
 * @private
 * @description Recursive method which trying to find a new `handle`, given the
 * existing copies
 * @param {Object} context -  an object containing the per-request state
 * @param {String} doorHandle - door `handle`
 * @param {String} doorId - current door `_id`
 * @param {String} shopId - ID of the shop that owns the door
 * @returns {String} handle - modified `handle`
 */
export default async function createHandle(
  context,
  doorHandle,
  doorId,
  shopId
) {
  let handle = doorHandle || "";

  // exception door._id needed for cases when double triggering happens
  const handleCount = await context.collections.Doors.find({
    handle,
    _id: {
      $nin: [doorId],
    },
    shopId,
  }).count();

  // current door "copy" number
  let handleNumberSuffix = 0;
  // door handle prefix
  let handleString = handle;
  // copySuffix "-copy-number" suffix of door
  const copySuffix =
    handleString.match(/-copy-\d+$/) || handleString.match(/-copy$/);

  // if door is a duplicate, we should take the copy number, and cut
  // the handle
  if (copySuffix) {
    // we can have two cases here: copy-number and just -copy. If there is
    // no numbers in copySuffix then we should put 1 in handleNumberSuffix
    handleNumberSuffix = +String(copySuffix).match(/\d+$/) || 1;
    // removing last numbers and last "-" if it presents
    handleString = handle.replace(/\d+$/, "").replace(/-$/, "");
  }

  // if we have more than one door with the same handle, we should mark
  // it as "copy" or increment our door handle if it contain numbers.
  if (handleCount > 0) {
    // if we have door with name like "door4", we should take care
    // about its uniqueness
    if (handleNumberSuffix > 0) {
      handle = `${handleString}-${handleNumberSuffix + handleCount}`;
    } else {
      // first copy will be "...-copy", second: "...-copy-2"
      handle = `${handleString}-copy${
        handleCount > 1 ? `-${handleCount}` : ""
      }`;
    }
  }

  // we should check again if there are any new matches with DB
  // exception door._id needed for cases then double triggering happens
  const existingDoorWithSameSlug = await context.collections.Doors.findOne(
    {
      handle,
      _id: {
        $nin: [doorId],
      },
      shopId,
    },
    {
      projection: {
        _id: 1,
      },
    }
  );

  if (existingDoorWithSameSlug) {
    handle = createHandle(context, handle, doorId, shopId);
  }

  return handle;
}
