const _ = require('lodash');
const BASE_COMMENTS = `
  id: ID!
  content: String!
  blocked: Boolean
  blockedThread: Boolean
  blockReason: String
  points: Int
  authorUser: UsersPermissionsUser
  authorType: String
  authorId: String
  authorName: String
  authorAvatar: String
  removed: Boolean
  relatedSlug: String
  reports: [CommentReport]
`;
const jsonParse = (json) => {
  try {
    return JSON.parse(json);
  } catch (e) {
    return {};
  }
};
const configRelatedContentTypes = Object.keys(strapi.config
  .get('plugins.comments.relatedContentTypes') || {})
  .map(key => `${key}: CommentsRelatedContentType`)
  .join('\n');
//  reports: [CommentReport]
module.exports = {
  // language=GraphQL
  definition: `
      scalar Relation
      enum CommentReportReason {
          BAD_LANGAUGE
          DISCRIMINATION
          OTHER
      }
      type CommentReport {
          id: ID!
          content: String
          reason: CommentReportReason!
          resolved: Boolean!
          related: Comment
      }
      type Comment {
        ${BASE_COMMENTS}
      }

      type CommentsInHierarchy {
        ${BASE_COMMENTS}
        children: [Comment]
      }

      type CommentsPagination {
        items: [Comment]!
        total: Int!
        page: Float
      }

      type CommentsWithThread {
        ${BASE_COMMENTS}
        threadOf: Comment
      }

      type CommentsFindOne {
        selected: CommentsWithThread
        level: [Comment]!
      }

      type CommentsContentTypes {
      key: String!
      value: String!
      }

      type CommentsRelatedContentType {
        contentManager: Boolean
        isSingle: Boolean
        url: String
      }

      type CommentsRelatedContentTypes {
        ${configRelatedContentTypes}
      }

      type CommentsConfig {
        contentsTypes: [CommentsContentTypes]!
        relatedContentTypes: CommentsRelatedContentTypes
      }

      type CommentsContentType {
        key: String!
        value: String
      }
  `,
  // language=GraphQL
  query: `
      findAllInHierarchy(relation: Relation!, where: JSON): [CommentsInHierarchy]!
      findAllFlat(relation: Relation!, where: JSON): [Comment]!
      findAll(related: Relation, entity: ID, where: JSON): CommentsPagination!
      findOne(id: ID!): CommentsFindOne
      config: CommentsConfig
      contentTypeName(contentType: String!): [CommentsContentType]!
  `,
  type: {
    Relation: 'It is related slug given when comment was created',
  },
  mutation: ``,
  resolver: {
    Query: {
      findAllInHierarchy: {
        resolverOf: 'plugins::comments.comments.findAllInHierarchy',
        resolver(obj, options) {
          const { relation, where } = options;
          const query = jsonParse(where);
          return strapi.plugins.comments.services.comments.findAllInHierarchy({
            relation,
            query,
            dropBlockedThreads: true,
          });
        },
      },
      findAllFlat: {
        resolverOf: 'plugins::comments.comments.findAllFlat',
        resolver(obj, options) {
          const { relation, where } = options;
          const query = jsonParse(where);
          return strapi.plugins.comments.services.comments.findAllFlat(relation, query);
        },
      },
      findAll: {
        resolverOf: 'plugins::comments.comments.findAll',
        resolver(obj, options) {
          const { related, entity, where } = options;
          const query = jsonParse(where);
          return strapi.plugins.comments.services.comments.findAll({
            ...query,
            related,
            entity,
          });
        },
      },
      findOne: {
        resolverOf: 'plugins::comments.comments.findOne',
        resolver(obj, options) {
          const { id } = options;
          return strapi.plugins.comments.services.comments.findOneAndThread(id);
        },
      },
      config: {
        resolverOf: 'plugins::comments.comments.config',
        resolver(obj, options, { context }) {
          return strapi.plugins.comments.controllers.comments.config(context);
        },
      },
      contentTypeName: {
        resolverOf: 'plugins::comments.comments.contentTypeName',
        resolver(obj, options) {
          const { contentType } = options;
          return strapi.plugins.comments.services.comments.contentTypeName(contentType);
        },
      },
    },
    Mutation: {},
  },
};

