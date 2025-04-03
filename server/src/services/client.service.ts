import { isEmpty } from 'lodash';
import { AdminUser, StrapiContext } from '../@types';
import { APPROVAL_STATUS, CONFIG_PARAMS } from '../const';
import { getCommentRepository, getReportCommentRepository } from '../repositories';
import { isLeft, unwrapEither } from '../utils/Either';
import PluginError from '../utils/error';
import { getPluginService } from '../utils/getPluginService';
import { tryCatch } from '../utils/tryCatch';
import { client } from '../validators/api';
import { Comment } from '../validators/repositories';
import { resolveUserContextError } from './utils/functions';

/**
 * Comments Plugin - Client services
 */

export const clientService = ({ strapi }: StrapiContext) => {
  const createAuthor = (author: client.NewCommentValidatorSchema['author'], user?: AdminUser) => {
    if (user) {
      return {
        authorId: user.id,
        authorName: user.username,
        authorEmail: user.email,
        authorAvatar: user.avatar,
      };
    } else if (author) {
      return {
        authorId: author.id,
        authorName: author.name,
        authorEmail: author.email,
        authorAvatar: author.avatar,
      };
    }

  };
  return ({
    getCommonService() {
      return getPluginService(strapi, 'common');
    },

    // Create a comment
    async create({ relation, content, threadOf, author, approvalStatus, locale, rating}: client.NewCommentValidatorSchema, user?: AdminUser) {
      const { uid, relatedId } = this.getCommonService().parseRelationString(relation);
      const relatedEntity = await strapi.documents(uid).findOne({ documentId: relatedId, locale });
      if (!relatedEntity) {
        throw new PluginError(
          400,
          `Relation for field "related" does not exist. Check your payload please.`,
        );
      }
      const approvalFlow = await this.getCommonService().getConfig(CONFIG_PARAMS.APPROVAL_FLOW, []);
      const isApprovalFlowEnabled = approvalFlow.includes(uid) || relatedEntity.requireCommentsApproval;
      const doNotPopulateAuthor = await this.getCommonService().getConfig(
        CONFIG_PARAMS.AUTHOR_BLOCKED_PROPS,
        [],
      );
      const threadData = await tryCatch(
        async () => {
          return threadOf ? await this.getCommonService().findOne({ id: threadOf, related: relation, locale: locale || null }) : null;
        },
        new PluginError(400, 'Thread does not exist'),
      );
      if (isLeft(threadData)) {
        throw unwrapEither(threadData);
      }
      const linkToThread = unwrapEither(threadData);
      if (!author && !this.getCommonService().isValidUserContext(user)) {
        throw resolveUserContextError(user);
      }

      const clearContent = await this.getCommonService().checkBadWords(content);
      const authorData = createAuthor(author, user);
      const authorNotProperlyProvided = !isEmpty(authorData) && !(authorData.authorId);
      if (isEmpty(authorData) || authorNotProperlyProvided) {
        throw new PluginError(400, 'Not able to recognise author of a comment. Make sure you\'ve provided "author" property in a payload or authenticated your request properly.');
      }
      if (isApprovalFlowEnabled && approvalStatus && approvalStatus !== APPROVAL_STATUS.PENDING) {
        throw new PluginError(400, 'Invalid approval status');
      }

      const comment = await getCommentRepository(strapi).create({
        data: {
          ...authorData,
          threadOf,
          locale,
          content: clearContent,
          related: relation,
          approvalStatus: isApprovalFlowEnabled ? APPROVAL_STATUS.PENDING : null,
          rating,
        },
      });
      const entity: Comment = {
        ...comment,
        threadOf: linkToThread,
      };
      const sanitizedEntity = this.getCommonService().sanitizeCommentEntity(entity, doNotPopulateAuthor);

      try {
        await this.sendResponseNotification(sanitizedEntity);
      } catch (e) {
        console.error(e);
      }
      return sanitizedEntity;
    },

    // Update a comment
    async update({ commentId, content, author, relation }: client.UpdateCommentValidatorSchema, user?: AdminUser) {
      if (!author && !this.getCommonService().isValidUserContext(user)) {
        throw resolveUserContextError(user);
      }
      const authorId = user?.id || author?.id;
      if (await this.getCommonService().checkBadWords(content)) {
        const blockedAuthorProps = await this.getCommonService().getConfig(CONFIG_PARAMS.AUTHOR_BLOCKED_PROPS, []);
        const existingComment = await this.getCommonService().findOne({ id: commentId, related: relation });
        
        if (existingComment && existingComment.author?.id?.toString() === authorId?.toString()) {
          const entity = await getCommentRepository(strapi).update({
            where: { id: commentId },
            data: { content },
            populate: { threadOf: true, authorUser: true },
          });
          return this.getCommonService().sanitizeCommentEntity(entity, blockedAuthorProps);
        }
      }
    },

    // Report abuse in comment
    async reportAbuse({ commentId, relation, ...payload }: client.ReportAbuseValidatorSchema, user?: AdminUser) {
      if (!this.getCommonService().isValidUserContext(user)) {
        throw resolveUserContextError(user);
      }

      try {
        const reportAgainstEntity = await this.getCommonService().findOne({
          id: commentId,
          related: relation,
        });

        if (reportAgainstEntity.isAdminComment) {
          throw new PluginError(
            403,
            `You're not allowed to take an action on that entity. This in a admin comment.`,
          );
        }

        if (reportAgainstEntity) {
          const entity = await getReportCommentRepository(strapi)
          .create({
            data: {
              ...payload,
              resolved: false,
              related: commentId,
            },
          });
          if (entity) {
            const response = {
              ...entity,
              related: reportAgainstEntity,
            };
            try {
              await this.sendAbuseReportEmail(entity.reason, entity.content); // Could also add some info about relation
              return response;
            } catch (err) {
              return response;
            }
          } else {
            throw new PluginError(500, 'Report cannot be created');
          }
        }
        throw new PluginError(
          403,
          `You're not allowed to take an action on that entity. Make sure that comment exist or you've authenticated your request properly.`,
        );
      } catch (e) {
        throw e;
      }
    },

    async markAsRemoved({ commentId, relation, authorId }: client.RemoveCommentValidatorSchema, user: AdminUser) {
      if (!authorId && !this.getCommonService().isValidUserContext(user)) {
        throw resolveUserContextError(user);
      }

      const author = user?.id || authorId;

      if (!author) {
        throw new PluginError(
          403,
          `You're not allowed to take an action on that entity. Make sure that you've provided proper "authorId" or authenticated your request properly.`,
        );
      }

      try {
        const byAuthor = user?.id
          ? {
            authorUser: author,
          }
          : {
            authorId: author,
          };
        const entity = await this.getCommonService().findOne({
          id: commentId,
          related: relation,
          ...byAuthor,
        });
        if (entity) {
          const removedEntity = await getCommentRepository(strapi)
          .update({
            where: {
              id: commentId,
              related: relation,
            },
            data: { removed: true },
            populate: { threadOf: true, authorUser: true },
          });

          await this.markAsRemovedNested(commentId, true);
          const doNotPopulateAuthor = await this.getCommonService().getConfig(CONFIG_PARAMS.AUTHOR_BLOCKED_PROPS, []);

          return this.getCommonService().sanitizeCommentEntity(removedEntity, doNotPopulateAuthor);
        } else {
          throw new PluginError(
            404,
            `Entity does not exist or you're not allowed to take an action on it`,
          );
        }
      } catch (e) {
        throw new PluginError(
          404,
          `Entity does not exist or you're not allowed to take an action on it`,
        );
      }
    },

    async sendAbuseReportEmail(reason: string, content: string) {
      const SUPER_ADMIN_ROLE = 'strapi-super-admin';
      const rolesToNotify = await this.getCommonService().getConfig(CONFIG_PARAMS.MODERATOR_ROLES, [SUPER_ADMIN_ROLE]);
      if (rolesToNotify.length > 0) {
        const emails = await strapi.query('admin::user')
                                   .findMany({ where: { roles: { code: rolesToNotify } } })
                                   .then((users) => users.map((user) => user.email));
        if (emails.length > 0) {
          const from = await strapi.query('admin::user').findOne({ where: { roles: { code: SUPER_ADMIN_ROLE } } });
          if (strapi.plugin('email')) {
            await strapi.plugin('email')
                        .service('email')
                        .send({
                          to: emails,
                          from: from.email,
                          subject: 'New abuse report on comment',
                          text: `
                        There was a new abuse report on your app. 
                        Reason: ${reason}
                        Message: ${content}
                    `,
                        });
          }
        }
      }
    },

    async markAsRemovedNested(commentId: string | number, status: boolean) {
      return this.getCommonService().modifiedNestedNestedComments(
        commentId,
        'removed',
        status,
      );
    },

    async sendResponseNotification(entity: Comment) {
      if (entity.threadOf) {
        const thread = typeof entity.threadOf === 'object' ? entity.threadOf : await this.getCommonService().findOne({ id: entity.threadOf });
        let emailRecipient = thread?.author?.email;
        if (thread.authorUser && !emailRecipient) {
          const strapiUser = typeof thread.authorUser === 'object' ? thread.authorUser : await strapi.query('plugin::users-permissions.user').findOne({
            where: { id: thread.authorUser },
          });
          emailRecipient = strapiUser?.email;
        }

        if (emailRecipient) {
          const superAdmin = await strapi.query('admin::user')
                                         .findOne({
                                           where: {
                                             roles: { code: 'strapi-super-admin' },
                                           },
                                         });

          const emailSender = await this.getCommonService().getConfig('client.contactEmail', superAdmin.email);
          const clientAppUrl = await this.getCommonService().getConfig('client.url', 'our site');

          try {
            await strapi
            .plugin('email')
            .service('email')
            .send({
              to: [emailRecipient],
              from: emailSender,
              subject: 'You\'ve got a new response to your comment',
              text: `Hello ${thread?.author?.name || emailRecipient}!
                You've got a new response to your comment by ${entity?.author?.name || entity?.author?.email}.
                
                ------

                "${entity.content}"

                ------
                
                Visit ${clientAppUrl} and continue the discussion.
                `,
            });
          } catch (err) {
            strapi.log.error(err);
            throw err;
          }
        }
      }
    },
  });
};

type ClientService = ReturnType<typeof clientService>;
export default clientService;
