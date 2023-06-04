import { ConfigParamKeys, RegExpCollection } from "../../types";

export const CONFIG_PARAMS: ConfigParamKeys = {
  ENABLED_COLLECTIONS: "enabledCollections",
  APPROVAL_FLOW: "approvalFlow",
  ENTRY_LABEL: "entryLabel",
  MODERATOR_ROLES: "moderatorRoles",
  BAD_WORDS: "badWords",
  AUTHOR_BLOCKED_PROPS: "blockedAuthorProps",
};

export const APPROVAL_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

export const AUTHOR_TYPE = {
  GENERIC: 'GENERIC',
  STRAPI: 'STRAPI',
};

export const REGEX: RegExpCollection = {
  uid: /^(?<type>[a-z0-9-]+)\:{2}(?<api>[a-z0-9-]+)\.{1}(?<contentType>[a-z0-9-]+)$/i,
  relatedUid:
    /^(?<uid>[a-z0-9-]+\:{2}[a-z0-9-]+\.[a-z0-9-]+)\:{1}(?<id>[a-z0-9-]+)$/i,
  email: /\S+@\S+\.\S+/,
  sorting: /^(?<path>[a-z0-9-_\:\.]+)\:+(asc|desc)$/i,
};
