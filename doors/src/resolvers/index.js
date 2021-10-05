import getConnectionTypeResolvers from "@reactioncommerce/api-utils/graphql/getConnectionTypeResolvers.js";
import DoorConfiguration from "./DoorConfiguration.js";
import Mutation from "./Mutation/index.js";
import Query from "./Query/index.js";
import Door from "./Door/index.js";
import DoorVariant from "./DoorVariant/index.js";

export default {
  DoorConfiguration,
  Mutation,
  Query,
  Door,
  DoorVariant,
  ...getConnectionTypeResolvers("Door"),
};
