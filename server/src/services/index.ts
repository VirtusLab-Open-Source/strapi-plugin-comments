"use strict";

import adminServices from "./admin.service";
import clientServices from "./client.service";
import commonServices from "./common.service";
import graphQLService from "./graphql.service";

const pluginServices = {
  admin: adminServices,
  client: clientServices,
  common: commonServices,
  gql: graphQLService,
};

export type PluginServices = {
  [key in keyof typeof pluginServices]: ReturnType<typeof pluginServices[key]>;
}

export default pluginServices;
