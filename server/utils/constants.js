const APPROVAL_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

const REGEX = {
  uid: new RegExp(/^(?<type>[a-z]+)\:{2}(?<api>[a-z]+)\.{1}(?<contentType>[a-z]+)$/gmi),
  relatedUid: new RegExp(/^(?<uid>[a-z]+\:{2}[a-z]+\.[a-z]+)\:{1}(?<id>[0-9]+)$/gmi),
  email: new RegExp(/\S+@\S+\.\S+/),
};

module.exports = {
  APPROVAL_STATUS,
  REGEX,
};
