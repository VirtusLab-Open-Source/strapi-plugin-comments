'use strict';

import adminServices from './admin/admin.service';
import clientServices from './client.service';
import commonServices from './common.service';
import gqlService from './gql.service';
import settingsService from './settings.service';

const pluginServices = {
  admin: adminServices,
  client: clientServices,
  common: commonServices,
  settings: settingsService,
  gql: gqlService
};

export type PluginServices = {
  [key in keyof typeof pluginServices]: ReturnType<typeof pluginServices[key]>;
}

export default pluginServices;
