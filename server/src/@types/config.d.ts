import { StrapiPluginConfig, TypeResult } from "strapi-typed";
import { RegExpCollection } from "./constants";

export type CommentsPluginConfig = StrapiPluginConfig<{
  enabledCollections: Array<string>;
  moderatorRoles: Array<string>;
  approvalFlow: Array<string>;
  blockedAuthorProps: Array<string>;
  entryLabel: PluginConfigEntryLabels;
  reportReasons: PluginConfigReportReasons;
  badWords?: boolean;
  client?: PluginConfigClientService;
  gql?: PluginConfigGraphQL;
}>;

export type PluginConfigClientService = {
  url?: string;
  contactEmail?: string;
};

export type PluginConfigGraphQL = {
  auth: boolean;
};

export type PluginConfigKeys = keyof CommentsPluginConfig;

export type ViewCommentsPluginConfig = {
  approvalFlow: TypeResult<SettingsCommentsPluginConfig["approvalFlow"]>;
  blockedAuthorProps: TypeResult<SettingsCommentsPluginConfig["blockedAuthorProps"]>;
  entryLabel: TypeResult<SettingsCommentsPluginConfig["entryLabel"]>;
  reportReasons: TypeResult<SettingsCommentsPluginConfig["reportReasons"]>;
  regex?: RegExpCollection;
};

export type SettingsCommentsPluginConfig = CommentsPluginConfig & {
  isGQLPluginEnabled?: boolean;
  regex?: RegExpCollection;
};

export type AnyConfig = ViewCommentsPluginConfig | SettingsCommentsPluginConfig;

export type StrapiConfig = {
  default: CommentsPluginConfig;
};

export type ConfigParamKeys = {
  [key: string]: PluginConfigKeys;
};
