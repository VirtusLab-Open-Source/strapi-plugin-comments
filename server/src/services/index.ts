'use strict';

import adminServices from './admin/admin.service';
import clientServices from './client.service';
import commonServices from './common.service';
import settingsService from './settings.service';

const pluginServices = {
  admin: adminServices,
  client: clientServices,
  common: commonServices,
  settings: settingsService,
};

export type PluginServices = {
  [key in keyof typeof pluginServices]: ReturnType<typeof pluginServices[key]>;
}

export default pluginServices;
