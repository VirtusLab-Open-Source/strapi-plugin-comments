'use strict';

import adminServices from './admin/admin.service';
import clientServices from './client.service';
import commonServices from './common.service';
import gqlService from './gql.service';
import reactionsServices from './reactions.service';
import settingsService from './settings.service';
import { emailService } from './email.service';

import type { AdminService } from './admin/admin.service';
import type { ClientService } from './client.service';
import type { CommonService } from './common.service';
import type { EmailService } from './email.service';
import type { GqlService } from './gql.service';
import type { ReactionsService } from './reactions.service';
import type { SettingsService } from './settings.service';

export type PluginServices = {
  admin: AdminService;
  client: ClientService;
  common: CommonService;
  reactions: ReactionsService;
  settings: SettingsService;
  gql: GqlService;
  email: EmailService;
};

type PluginServiceFactories = {
  admin: typeof adminServices;
  client: typeof clientServices;
  common: typeof commonServices;
  reactions: typeof reactionsServices;
  settings: typeof settingsService;
  gql: typeof gqlService;
  email: typeof emailService;
};

const pluginServices: PluginServiceFactories = {
  admin: adminServices,
  client: clientServices,
  common: commonServices,
  reactions: reactionsServices,
  settings: settingsService,
  gql: gqlService,
  email: emailService,
};

export default pluginServices;
