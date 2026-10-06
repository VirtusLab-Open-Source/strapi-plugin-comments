'use strict';

import adminServices from './admin/admin.service';
import clientServices from './client.service';
import commonServices from './common.service';
import gqlService from './gql.service';
import reactionsServices from './reactions.service';
import settingsService from './settings.service';
import { emailService } from './email.service';

const pluginServices = {
  admin: adminServices,
  client: clientServices,
  common: commonServices,
  reactions: reactionsServices,
  settings: settingsService,
  gql: gqlService,
  email: emailService,
};

export type PluginServices = {
  [key in keyof typeof pluginServices]: ReturnType<typeof pluginServices[key]>;
}

export default pluginServices;
