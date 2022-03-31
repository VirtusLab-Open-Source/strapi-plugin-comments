import { StrapiPluginConfig, TypeResult } from "strapi-typed";
import { RegExpCollection } from "./constants";

export type CommentsPluginConfig = StrapiPluginConfig<{
  enabledCollections: Array<string>;
  moderatorRoles: Array<string>;
  approvalFlow: Array<string>;
  entryLabel: PluginConfigEntryLabels;
  reportReasons: PluginConfigReportReasons;
  badWords?: boolean;
}>;

export type PluginConfigKeys = keyof CommentsPluginConfig;

export type ViewCommentsPluginConfig = {
  approvalFlow: TypeResult<SettingsCommentsPluginConfig["approvalFlow"]>;
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
