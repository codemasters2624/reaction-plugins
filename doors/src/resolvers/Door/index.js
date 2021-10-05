import resolveShopFromShopId from "@reactioncommerce/api-utils/graphql/resolveShopFromShopId.js";
import { encodeDoorOpaqueId } from "../../xforms/id.js";
import getVariants from "../../utils/getVariants.js";
import getUnits from "../../utils/getUnits.js";
// import getDoorMedia from "../../utils/getDoorMedia.js";
import socialMetadata from "./socialMetadata.js";
import tagIds from "./tagIds.js";
import tags from "./tags.js";

console.log("I am inside /resolver/door/index.js");
export default {
  _id: (node) => encodeDoorOpaqueId(node._id),
  // media: (node, args, context) => getDoorMedia(node, args, context),
  metafields: (node) => node.metafields || [],
  shop: resolveShopFromShopId,
  slug: (node) => node.handle,
  socialMetadata,
  tagIds,
  tags,
  // {
  // console.log("args", args);
  // console.log("context", context);
  // console.log("node", node);
  // return [{ _id: "123", title: "aassdd" }];
  // },
  variants: (node, args, context) => getVariants(context, node._id, true, args),
  doorUnits: (node, args, context) =>
    getUnits(context, node._id, node.height, node.width, true, args),
};
