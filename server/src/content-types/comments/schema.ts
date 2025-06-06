import { APPROVAL_STATUS } from '../../const';

export default {
  collectionName: "plugin_comments_comments",
  info: {
    tableName: "plugin-comments-comments",
    singularName: "comment",
    pluralName: "comments",
    displayName: "Comment",
    description: "Comment content type",
    kind: "collectionType",
  },
  options: {
    draftAndPublish: false,
  },
  pluginOptions: {
    "content-manager": {
      visible: false,
    },
    "content-type-builder": {
      visible: false,
    },
  },
  attributes: {
    content: {
      type: "text",
      configurable: false,
      required: true,
    },
    blocked: {
      type: "boolean",
      default: false,
      configurable: false,
    },
    blockedThread: {
      type: "boolean",
      default: false,
      configurable: false,
    },
    blockReason: {
      type: "string",
      configurable: false,
    },
    authorUser: {
      type: "relation",
      relation: "oneToOne",
      target: "plugin::users-permissions.user",
      configurable: false,
    },
    authorId: {
      type: "string",
      configurable: false,
    },
    authorName: {
      type: "string",
      configurable: false,
    },
    authorEmail: {
      type: "email",
      configurable: false,
    },
    authorAvatar: {
      type: "string",
      configurable: false,
    },
    isAdminComment: {
      type: "boolean",
      configurable: false,
    },
    removed: {
      type: "boolean",
      configurable: false,
    },
    approvalStatus: {
      type: "enumeration",
      enum: Object.values(APPROVAL_STATUS),
      configurable: false,
    },
    related: {
      type: "string",
      configurable: false,
    },
    reports: {
      type: "relation",
      relation: "oneToMany",
      target: "plugin::comments.comment-report",
      mappedBy: "related",
      configurable: false,
    },
    threadOf: {
      type: "relation",
      relation: "oneToOne",
      target: "plugin::comments.comment",
      configurable: false,
    },
    rating: {
      type: "float",
      min: "0",
      max: "5",
      step: "0.5",
    },
    lastExperience: {
      type: "string",
    },
  },
};
