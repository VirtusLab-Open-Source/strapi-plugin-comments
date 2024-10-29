import { isEmpty } from 'lodash';
import { AdminUser, StrapiContext } from '../@types-v5';
import { APPROVAL_STATUS, CONFIG_PARAMS } from '../const';
import { getCommentRepository } from '../repositories';
import { isLeft, unwrapEither } from '../utils/Either';
import PluginError from '../utils/error';
import { getPluginService } from '../utils/getPluginService';
import { tryCatch } from '../utils/tryCatch';
import { CommentData } from '../validators/api';
import { Comment } from '../validators/repositories';
import { resolveUserContextError } from './utils/functions';

/**
 * Comments Plugin - Client services
 */

export const clientService = ({ strapi }: StrapiContext) => {
  const createAuthor = (isValidContent: boolean, author: CommentData['author'], user?: AdminUser) => {
    if (isValidContent && user) {
      return {
        authorUser: user.id,
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
    async create({ relation, content, threadOf, author, approvalStatus }: CommentData, user?: AdminUser) {
      const { uid, relatedId } = this.getCommonService().parseRelationString(relation);
      const relatedEntity = await strapi.entityService.findOne(uid, relatedId);
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
          return threadOf ? await this.getCommonService().findOne({ id: threadOf, related: relation }) : null;
        },
        new PluginError(400, 'Thread does not exist'),
      );
      if (isLeft(threadData)) {
        throw unwrapEither(threadData);
      }
      const linkToThread = unwrapEither(threadData);
      const isValidContext = this.getCommonService().isValidUserContext(user);
      if (!isValidContext) {
        throw resolveUserContextError(user);
      }

      const clearContent = await this.getCommonService().checkBadWords(content);
      const authorData = createAuthor(isApprovalFlowEnabled, author, user);
      const authorNotProperlyProvided = !isEmpty(authorData) && !(authorData.authorId || authorData.authorUser);
      if (isEmpty(authorData) || authorNotProperlyProvided) {
        throw new PluginError(400, 'Not able to recognise author of a comment. Make sure you\'ve provided "author" property in a payload or authenticated your request properly.');
      }
      if (isApprovalFlowEnabled && approvalStatus && approvalStatus !== APPROVAL_STATUS.PENDING) {
        throw new PluginError(400, 'Invalid approval status');
      }

      const comment = await getCommentRepository(strapi).create({
        data: {
          ...authorData,
          content: clearContent,
          related: relation,
          approvalStatus: isApprovalFlowEnabled ? APPROVAL_STATUS.PENDING : null,
        },
        populate: {
          authorUser: true,
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
    async update() {
    },

    // Report abuse in comment
    async reportAbuse() {
    },

    async markAsRemoved() {
    },

    async sendAbuseReportEmail() {
    },

    async markAsRemovedNested() {
    },

    async sendResponseNotification(_entry: Comment) {},
  });
};

type ClientService = ReturnType<typeof clientService>;
export default clientService;