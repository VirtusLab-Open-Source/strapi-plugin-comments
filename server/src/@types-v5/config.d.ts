
export type CommentsPluginConfig = {
  enabledCollections: Array<string>;
  moderatorRoles: Array<string>;
  approvalFlow: Array<string>;
  blockedAuthorProps: Array<string>;
  entryLabel: any;
  reportReasons: any;
  badWords?: boolean;
  client?: PluginConfigClientService;
  gql?: PluginConfigGraphQL;
};

export type PluginConfigClientService = {
  url?: string;
  contactEmail?: string;
};

export type PluginConfigGraphQL = {
  auth: boolean;
};

export type ViewCommentsPluginConfig = {
  approvalFlow: SettingsCommentsPluginConfig['approvalFlow'];
  blockedAuthorProps: SettingsCommentsPluginConfig['blockedAuthorProps'];
  entryLabel: SettingsCommentsPluginConfig['entryLabel'];
  reportReasons: SettingsCommentsPluginConfig['reportReasons'];
  regex?: any;
};

export type SettingsCommentsPluginConfig = CommentsPluginConfig & {
  isGQLPluginEnabled?: boolean;
  regex?: any;
};


export type StrapiConfig = {
  default: CommentsPluginConfig;
};