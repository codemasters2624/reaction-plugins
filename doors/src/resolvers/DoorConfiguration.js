import { encodeDoorOpaqueId } from "../xforms/id.js";

export default {
  doorId: (node) => encodeDoorOpaqueId(node.doorId),
  doorVariantId: (node) => encodeDoorOpaqueId(node.doorVariantId),
};
