export const APPROVAL_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

export const REPORT_STATUS = {
  'RESOLVED': 'RESOLVED',
  'OPEN': 'OPEN',
};

export const REPORT_REASON = {
  'BAD_LANGUAGE': 'BAD_LANGUAGE',
  'DISCRIMINATION': 'DISCRIMINATION',
  'OTHER': 'OTHER',
};

export const COMMENT_STATUS = {
  'BLOCKED': 'BLOCKED',
  'OPEN': 'OPEN',
  'TO_REVIEW': 'TO_REVIEW',
};

export const REGEX = {
  uid: new RegExp(/^(?<type>[a-z]+)\:{2}(?<api>[a-z]+)\.{1}(?<contentType>[a-z]+)$/gmi),
  relatedUid: new RegExp(/^(?<uid>[a-z]+\:{2}[a-z]+\.[a-z]+)\:{1}(?<id>[0-9]+)$/gmi),
  email: new RegExp(/\S+@\S+\.\S+/),
};