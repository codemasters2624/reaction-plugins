import { encodeUnitOpaqueId } from "../xforms/id.js";

export default {
  unitId: (node) => encodeUnitOpaqueId(node.unitId),
  unitVariantId: (node) => encodeUnitOpaqueId(node.unitVariantId),
};
