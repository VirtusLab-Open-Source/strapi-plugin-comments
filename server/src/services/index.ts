'use strict';

import adminServices from './admin/admin.service';
import clientServices from './client.service';
import commonServices from './common.service';
import gqlService from './gql.service';
import reactionsServices from './reactions.service';
import settingsService from './settings.service';
import { emailService } from './email.service';

export type CommentsPluginServices = {
  admin: typeof adminServices;
  client: typeof clientServices;
  common: typeof commonServices;
  reactions: typeof reactionsServices;
  settings: typeof settingsService;
  gql: typeof gqlService;
  email: typeof emailService;
};

const pluginServices: CommentsPluginServices = {
  admin: adminServices,
  client: clientServices,
  common: commonServices,
  reactions: reactionsServices,
  settings: settingsService,
  gql: gqlService,
  email: emailService,
};

export type PluginServices = {
  [key in keyof typeof pluginServices]: ReturnType<(typeof pluginServices)[key]>;
};

export default pluginServices;
