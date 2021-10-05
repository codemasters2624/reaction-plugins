import importAsString from "@reactioncommerce/api-utils/importAsString.js";

const door = importAsString("./door.graphql");
const schema = importAsString("./schema.graphql");
export default [schema, door];
