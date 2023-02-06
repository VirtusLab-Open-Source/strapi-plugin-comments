import { StrapiConfig } from "../../types";

const config: StrapiConfig = {
  default: {
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
  },
};

export default config;
