import resolveShopFromShopId from "@reactioncommerce/api-utils/graphql/resolveShopFromShopId.js";
import { encodeUnitOpaqueId } from "../../xforms/id.js";
import getVariants from "../../utils/getVariants.js";
import getDoorVariants from "../../utils/getDoorVariants.js";
// import getUnitMedia from "../../utils/getUnitMedia.js";
import socialMetadata from "./socialMetadata.js";
import tagIds from "./tagIds.js";
import tags from "./tags.js";

export default {
  _id: (node) => encodeUnitOpaqueId(node._id),
  // media: (node, args, context) => getUnitMedia(node, args, context),
  metafields: (node) => node.metafields || [],
  shop: resolveShopFromShopId,
  slug: (node) => node.handle,
  socialMetadata,
  tagIds,
  tags,
  doorVariants: (node, args, context) =>
    getDoorVariants(context, node._id, node.doorVariant, true, args),
  // {
  // console.log("args", args);
  // console.log("context", context);
  // console.log("node", node);
  // return [{ _id: "123", title: "aassdd" }];
  // },
  variants: (node, args, context) => getVariants(context, node._id, true, args),
};
