import { StrapiConfig } from '../@types-v5/config';

const defaultPluginConfig = {
  enabledCollections: [],
  moderatorRoles: [],
  approvalFlow: [],
  entryLabel: {
    "*": ["Title", "title", "Name", "name", "Subject", "subject"],
  },
  reportReasons: {
    BAD_LANGUAGE: "BAD_LANGUAGE",
    DISCRIMINATION: "DISCRIMINATION",
    OTHER: "OTHER",
  },
  blockedAuthorProps: [],
};





const config: StrapiConfig = {
  default: defaultPluginConfig,
};

export default config;
