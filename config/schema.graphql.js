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
  approvalStatus: CommentApprovalStatus
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
      enum CommentApprovalStatus {
          PENDING
          APPROVED
          REJECTED
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
      
      type CommentRemove {
        id: ID!
      }

      input NewCommentRelated {
        refId: String!
        ref: String!
        field: String!
      }

      input CommentNew {
        authorId: String
        authorName: String
        authorEmail: String
        content: String!
        authorUsername: String
        threadOf: String
        related: [NewCommentRelated!]!
        approvalStatus: CommentApprovalStatus
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
  // language=GraphQL
  mutation: `
      commentAdd(comment: CommentNew): Comment!
      commentUpdate(id: ID!, content: String!, related: NewCommentRelated): Comment!
      commentReportAbuse(id: ID!, relation: Relation!, reason: CommentReportReason!, content: String!): CommentReport
      commentLike(id: ID!, relation: Relation!): Comment
      commentRemove(id: ID!, relation: Relation!, authorId: ID!): CommentRemove
      commentBlock(id: ID!): Comment
      commentThreadBlock(id: ID!): Comment
      commentResolveReport(reportId: ID!, commentId: ID!): CommentReport
  `,
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
    Mutation: {
      commentAdd: {
        resolverOf: 'plugins::comments.comments.post',
        policies: ['plugins::users-permissions.isAuthenticated'],
        resolver(obj, options, { context }) {
          const user = context.state.user;
          const { comment } = options;
          return strapi.plugins.comments.services.comments
            .create(comment, user);
        },
      },
      commentUpdate: {
        resolverOf: 'plugins::comments.comments.put',
        policies: ['plugins::users-permissions.isAuthenticated'],
        resolver(obj, options, { context }) {
          const user = context.state.user;
          const { id, ...data } = options;
          return strapi.plugins.comments.services.comments
            .update(id, data, user);
        },
      },
      commentReportAbuse: {
        resolverOf: 'plugins::comments.comments.reportAbuse',
        policies: ['plugins::users-permissions.isAuthenticated'],
        resolver(obj, options, { context }) {
          const user = context.state.user;
          const { id, relation, reason, content } = options;
          return strapi.plugins.comments.services.comments
            .reportAbuse(id, relation, { reason, content }, user);
        },
      },
      commentLike: {
        resolverOf: 'plugins::comments.comments.pointsUp',
        policies: ['plugins::users-permissions.isAuthenticated'],
        resolver(obj, options, { context }) {
          const user = context.state.user;
          const { id, relation } = options;
          return strapi.plugins.comments.services.comments
            .pointsUp(id, relation, user);
        },
      },
      commentRemove: {
        resolverOf: 'plugins::comments.comments.removeComment',
        resolver(obj, options) {
          const { id, relation, authorId } = options;
          return strapi.plugins.comments.services.comments
            .markAsRemoved(relation, id, authorId);
        },
      },
      commentBlock: {
        resolverOf: 'plugins::comments.comments.blockComment',
        resolver(obj, options) {
          const { id } = options;
          return strapi.plugins.comments.services.comments
            .blockComment(id);
        },
      },
      commentThreadBlock: {
        resolverOf: 'plugins::comments.comments.blockCommentThread',
        resolver(obj, options) {
          const { id } = options;
          return strapi.plugins.comments.services.comments
            .blockCommentThread(id);
        },
      },
      commentResolveReport: {
        resolverOf: 'plugins::comments.comments.resolveAbuseReport',
        resolver(obj, options) {
          const { reportId, commentId } = options;
          return strapi.plugins.comments.services.comments
            .resolveAbuseReport(reportId, commentId);
        },
      },
    },
  },
};

