import SimpleSchema from "simpl-schema";

const filters = new SimpleSchema({
  doorIds: {
    type: Array,
    optional: true,
  },
  "doorIds.$": String,
  shopIds: {
    type: Array,
    optional: true,
  },
  "shopIds.$": String,
  tagIds: {
    type: Array,
    optional: true,
  },
  "tagIds.$": String,
  query: {
    type: String,
    optional: true,
  },
  isArchived: {
    type: Boolean,
    optional: true,
  },
  isVisible: {
    type: Boolean,
    optional: true,
  },
  metafieldKey: {
    type: String,
    optional: true,
  },
  metafieldValue: {
    type: String,
    optional: true,
  },
  priceMin: {
    type: Number,
    optional: true,
  },
  priceMax: {
    type: Number,
    optional: true,
  },
});

/**
 * @name applyDoorFilters
 * @summary Builds a selector for Doors collection, given a set of filters
 * @private
 * @param {Object} context - an object containing the per-request state
 * @param {Object} doorFilters - See filters schema above
 * @returns {Object} Selector
 */
export default function applyDoorFilters(context, doorFilters) {
  // if there are filter/params that don't match the schema
  filters.validate(doorFilters);

  // Init default selector - Everyone can see doors that fit this selector
  let selector = {
    ancestors: [], // Lookup top-level doors
    isDeleted: { $ne: true }, // by default, we don't publish deleted doors
  };

  if (doorFilters) {
    // filter by doorIds
    if (doorFilters.doorIds) {
      selector = {
        ...selector,
        _id: {
          $in: doorFilters.doorIds,
        },
      };
    }

    if (doorFilters.shopIds) {
      selector = {
        ...selector,
        shopId: {
          $in: doorFilters.shopIds,
        },
      };
    }

    // filter by tags
    if (doorFilters.tagIds) {
      selector = {
        ...selector,
        hashtags: {
          $in: doorFilters.tagIds,
        },
      };
    }

    // filter by query
    if (doorFilters.query) {
      const cond = {
        $regex: doorFilters.query,
        $options: "i",
      };
      selector = {
        ...selector,
        $or: [
          {
            title: cond,
          },
          {
            pageTitle: cond,
          },
          {
            description: cond,
          },
        ],
      };
    }

    // filter by details
    if (doorFilters.metafieldKey && doorFilters.metafieldValue) {
      selector = {
        ...selector,
        metafields: {
          $elemMatch: {
            key: {
              $regex: doorFilters.metafieldKey,
              $options: "i",
            },
            value: {
              $regex: doorFilters.metafieldValue,
              $options: "i",
            },
          },
        },
      };
    }

    // filter by visibility
    if (doorFilters.isVisible !== undefined) {
      selector = {
        ...selector,
        isVisible: doorFilters.isVisible,
      };
    }

    // filter by archived
    if (doorFilters.isArchived !== undefined) {
      selector = {
        ...selector,
        isDeleted: doorFilters.isArchived,
      };
    }

    // filter by gte minimum price
    if (doorFilters.priceMin && !doorFilters.priceMax) {
      selector = {
        ...selector,
        "price.min": {
          $gte: parseFloat(doorFilters.priceMin),
        },
      };
    }

    // filter by lte maximum price
    if (doorFilters.priceMax && !doorFilters.priceMin) {
      selector = {
        ...selector,
        "price.max": {
          $lte: parseFloat(doorFilters.priceMax),
        },
      };
    }

    // filter with a price range
    if (doorFilters.priceMin && doorFilters.priceMax) {
      const priceMin = parseFloat(doorFilters.priceMin);
      const priceMax = parseFloat(doorFilters.priceMax);

      // Filters a whose min and max price range are within the
      // range supplied from the filter
      selector = {
        ...selector,
        "price.min": {
          $gte: priceMin,
        },
        "price.max": {
          $lte: priceMax,
        },
      };
    }
  } // end if doorFilters

  return selector;
}
