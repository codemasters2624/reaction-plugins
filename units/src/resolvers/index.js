import getConnectionTypeResolvers from "@reactioncommerce/api-utils/graphql/getConnectionTypeResolvers.js";
import UnitConfiguration from "./UnitConfiguration.js";
import Mutation from "./Mutation/index.js";
import Query from "./Query/index.js";
import Unit from "./Unit/index.js";
import UnitVariant from "./UnitVariant/index.js";

export default {
  UnitConfiguration,
  Mutation,
  Query,
  Unit,
  UnitVariant,
  ...getConnectionTypeResolvers("Unit"),
};
