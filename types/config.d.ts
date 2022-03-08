export type PluginConfigKeys = 'enabledCollections' | 'approvalFlow' | 'entryLabel' | 'moderatorRoles' | 'badWords';

export enum PluginConfigKeysEnum {
    ENABLED_COLLECTIONS = 'enabledCollections',
    APPROVAL_FLOW = 'approvalFlow',
    ENTRY_LABEL = 'entryLabel',
    MODERATOR_ROLES = 'moderatorRoles',
    BAD_WORDS = 'badWords'
}

export type PluginConfigEntryLabels = {
    [key: string]: Array<string>
};

export type PluginConfigReportReasons = {
    [key: string]: string
};

export type PluginConfig<Type> = {
    [Property in keyof Type]: Type[Property];
};

export type CommentsPluginConfig = PluginConfig<{
    enabledCollections: Array<string>
    moderatorRoles: Array<string>
    approvalFlow: Array<string>
    entryLabel: PluginConfigEntryLabels
    reportReasons: PluginConfigReportReasons
    badWords?: boolean
}>;

export type StrapiConfig = {
    default: CommentsPluginConfig
};

export type ConfigParamKeys = {
    [key: string]: PluginConfigKeys
  }