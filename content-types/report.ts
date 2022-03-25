/**
 * Comments Collection Type
 */

export default {
  info: {
    tableName: 'plugin-comments-reports',
    singularName: 'comment-report',
    pluralName: 'comment-reports',
    displayName: 'Reports',
    description: 'Reports content type',
    kind: 'collectionType',
  },
  options: {
    draftAndPublish: false,
  },
  pluginOptions: {
    'content-manager': {
      visible: false
    },
    'content-type-builder': {
      visible: false
    }
  },
  attributes: {
    content: {
      type: 'text',
      configurable: false
    },
    reason: {
      type: 'enumeration',
      enum: [
        'BAD_LANGUAGE',
        'DISCRIMINATION',
        'OTHER'
      ],
      default: 'OTHER',
      configurable: false,
      required: true
    },
    resolved: {
      type: 'boolean',
      default: false,
      configurable: false
    },
    related: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::comments.comment',
      inversedBy: 'reports',
      configurable: false,
    },
  },
};
