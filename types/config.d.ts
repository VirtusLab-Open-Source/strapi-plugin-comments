import { StrapiPluginConfig } from "strapi-typed";
import { RegExpCollection } from "./constants";

export type PluginConfigKeys =
  | "enabledCollections"
  | "approvalFlow"
  | "entryLabel"
  | "moderatorRoles"
  | "badWords"
  | "reportReasons";

export enum PluginConfigKeysEnum {
  ENABLED_COLLECTIONS = "enabledCollections",
  APPROVAL_FLOW = "approvalFlow",
  ENTRY_LABEL = "entryLabel",
  MODERATOR_ROLES = "moderatorRoles",
  BAD_WORDS = "badWords",
  REPORT_REASONS = "reportReasons",
}

export type PluginConfigEntryLabels = {
  [key: string]: Array<string>;
};

export type PluginConfigReportReasons = {
  [key: string]: string;
};

export type CommentsPluginConfig = StrapiPluginConfig<{
  enabledCollections: Array<string>;
  moderatorRoles: Array<string>;
  approvalFlow: Array<string>;
  entryLabel: PluginConfigEntryLabels;
  reportReasons: PluginConfigReportReasons;
  badWords?: boolean;
}>;

export type ViewCommentsPluginConfig = Pick<
  CommentsPluginConfig,
  | PluginConfigKeysEnum.APPROVAL_FLOW
  | PluginConfigKeysEnum.ENTRY_LABEL
  | PluginConfigKeysEnum.REPORT_REASONS
> & {
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
