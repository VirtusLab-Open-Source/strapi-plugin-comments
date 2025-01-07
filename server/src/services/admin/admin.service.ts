import { isNil } from 'lodash';
import { Id, StrapiContext } from '../../@types';
import { APPROVAL_STATUS } from '../../const';
import { getCommentRepository, getReportCommentRepository } from '../../repositories';
import { getDefaultAuthorPopulate } from '../../repositories/utils';
import { getPluginService } from '../../utils/getPluginService';
import PluginError from '../../utils/PluginError';

import { admin as adminValidator } from '../../validators/api';
import { filterOurResolvedReports, getAuthorName } from '../utils/functions';
import { getAdminServiceUtils } from './utils';

export default ({ strapi }: StrapiContext) => {
  const utils = getAdminServiceUtils(strapi);
  return ({
    getCommonService() {
      return getPluginService(strapi, 'common');
    },

    // Find all comments
    async findAll({ _q, orderBy, page, pageSize }: adminValidator.CommentFindAllSchema) {
      const params = utils.findAll.createParams(
        orderBy,
        page,
        pageSize,
        _q,
      );

      const populate = utils.findAll.getPopulate();
      const commentRepository = getCommentRepository(strapi);
      const { pagination, results } = await commentRepository.findWithCount({
        ...params,
        count: true,
        populate,
      });

      const relatedEntities = await this.getCommonService().findRelatedEntitiesFor(results);

      return {
        pagination,
        result: results.map((_) => this.getCommonService().sanitizeCommentEntity(_, [], []))
                       .map(_ => this.getCommonService().mergeRelatedEntityTo(_, relatedEntities)),
      };
    },

    async findReports({ _q, orderBy, page, pageSize }: adminValidator.ReportFindReportsValidator) {
      const params = utils.findReports.createParams(
        orderBy,
        page,
        pageSize,
        _q,
      );
      const { pagination, results } = await getReportCommentRepository(strapi).findPage({
        ...params,
        populate: ['related'],
      });

      const reportCommentsIds = results.map((entity) => typeof entity.related === 'object' ? entity.related.id : null).filter(Boolean);

      const defaultAuthorUserPopulate = getDefaultAuthorPopulate(strapi);
      const commentsThreads = await getCommentRepository(strapi).findMany({
        where: {
          threadOf: reportCommentsIds,
        },
        populate: ['threadOf'],
        limit: Number.MAX_SAFE_INTEGER,
      });
      const commentWithThreadIds = Array.from(new Set(commentsThreads
        .map(({ threadOf }) => typeof threadOf === 'object' ? threadOf.id : null)
        .filter(Boolean)),
      );
      const result = results.map((_) => {
        const isCommentWithThread = commentWithThreadIds.includes(_.related.id);
        const commonService = this.getCommonService();

        const entity = {
          ..._,
          related: commonService.sanitizeCommentEntity(
            {
              ..._.related,
              gotThread: isCommentWithThread,
            },
            [],
          ),
        };
        const populate = typeof defaultAuthorUserPopulate !== 'boolean' ? defaultAuthorUserPopulate?.populate : {};
        return filterOurResolvedReports(
          commonService.sanitizeCommentEntity(
            entity,
            [],
            [],
            populate,
          ),
        );
      });


      return {
        result,
        pagination,
      };
    },
    async findOneAndThread({ id, removed, ...query }: adminValidator.FindOneValidatorSchema) {
      const defaultAuthorUserPopulate = getDefaultAuthorPopulate(strapi);
      const defaultWhere = utils.findOneAndThread.getDefaultWhere(removed);

      const defaultPopulate: any = utils.findOneAndThread.getPopulate();

      const entity = await getCommentRepository(strapi).findOne({
        ...defaultPopulate,
        where: { id },
      });

      if (!entity) {
        throw new PluginError(404, 'Not found');
      }

      const { relatedId, uid } = this.getCommonService().parseRelationString(entity.related);
      const relatedEntity = await strapi.documents(uid)
                                        .findOne({ documentId: relatedId })
                                        .then((_) => {
                                          if (!_) {
                                            throw new PluginError(404, 'Relation not found');
                                          }
                                          return { ..._, uid };
                                        });
      const levelThreadId = entity.threadOf && typeof entity.threadOf === 'object' ? entity.threadOf.documentId : null;

      const entitiesOnSameLevel =
        await this.getCommonService().findAllInHierarchy(
          {
            query: {
              ...defaultWhere,
              ...query,
              threadOf: levelThreadId,
              related: entity.related,
            },
            ...defaultPopulate,
            startingFromId: levelThreadId,
            isAdmin: true,
          },
          false,
        );

      const populate = typeof defaultAuthorUserPopulate !== 'boolean' ? defaultAuthorUserPopulate?.populate : {};
      const selectedEntity = this.getCommonService().sanitizeCommentEntity(
        {
          ...entity,
          threadOf: entity.threadOf || null,
        },
        [],
        [],
        populate,
      );

      return {
        entity: relatedEntity,
        selected: selectedEntity,
        level: entitiesOnSameLevel,
      };
    },
    async changeBlockedComment(id: Id, forceStatus?: boolean) {
      const entry = await this.getCommonService().findOne({ id });
      return this.getCommonService().updateComment(
        { id },
        { blocked: !isNil(forceStatus) ? forceStatus : !entry.blocked },
      );
    },
    async deleteComment(id: Id) {
      return getCommentRepository(strapi).update({ where: { id }, data: { removed: true } });
    },
    async blockCommentThread(id: Id, forceStatus?: boolean) {
      const entry = await this.getCommonService().findOne({ id });
      const status = forceStatus || !entry.blocked;
      const updatedEntry = await this.getCommonService().updateComment(
        { id },
        { blocked: status, blockedThread: status },
      );
      await this.blockNestedThreads(id, status);
      return this.getCommonService().sanitizeCommentEntity(updatedEntry, []);
    },
    async approveComment(id: Id) {
      const entity = await getCommentRepository(strapi).update({
        where: { id },
        data: { approvalStatus: APPROVAL_STATUS.APPROVED },
      });
      if (!entity) {
        throw new PluginError(404, 'Not found');
      }
      return this.getCommonService().sanitizeCommentEntity(entity, []);
    },
    async rejectComment(id: Id) {
      const entity = await getCommentRepository(strapi).update({
        where: { id },
        data: { approvalStatus: APPROVAL_STATUS.REJECTED },
      });
      if (!entity) {
        throw new PluginError(404, 'Not found');
      }
      return this.getCommonService().sanitizeCommentEntity(entity, []);
    },
    async blockNestedThreads(id: Id, status: boolean) {
      return this.getCommonService().modifiedNestedNestedComments(
        id,
        'blockedThread',
        status,
      );
    },
    async resolveAbuseReport({
      id: commentId,
      reportId,
    }: adminValidator.CommentResolveAbuseReportValidatorSchema) {
      return getReportCommentRepository(strapi).update({
        where: {
          id: reportId,
          related: commentId,
        },
        data: {
          resolved: true,
        },
      });
    },
    async resolveCommentMultipleAbuseReports({
      id: commentId,
      reportIds: ids,
    }: adminValidator.CommentResolveMultipleAbuseReportsValidatorSchema) {
      const reports = await getReportCommentRepository(strapi).findMany({
        where: {
          id: ids,
          related: commentId,
        },
        populate: ['related'],
      });

      if (reports.length === ids.length) {
        return getReportCommentRepository(strapi).updateMany({
          where: {
            id: ids,
          },
          data: {
            resolved: true,
          },
        });
      }
      throw new PluginError(
        400,
        'At least one of selected reports got invalid comment entity relation. Try again.',
      );
    },
    async resolveAllAbuseReportsForComment(id: Id) {
      if (!id) {
        throw new PluginError(
          400,
          'There is something wrong with comment Id. Try again.',
        );
      }
      return getReportCommentRepository(strapi).updateMany({
        where: {
          related: id,
          resolved: false,
        },
        data: {
          resolved: true,
        },
      });
    },
    async resolveAllAbuseReportsForThread(commentId: number) {
      if (!commentId) {
        throw new PluginError(
          400,
          'There is something wrong with comment Id. Try again.',
        );
      }
      const commentsInThread = await getCommentRepository(strapi).findMany({
        where: {
          threadOf: commentId,
        },
        select: ['id'],
      });
      return getReportCommentRepository(strapi).updateMany({
        where: {
          related: commentsInThread.map(({ id }) => id).concat([commentId]),
          resolved: false,
        },
        data: {
          resolved: true,
        },
      });
    },
    async resolveMultipleAbuseReports({
      reportIds,
    }: adminValidator.ReportsMultipleAbuseValidator) {
      return getReportCommentRepository(strapi).updateMany({
        where: {
          id: { $in: reportIds },
        },
        data: {
          resolved: true,
        },
      });
    },
    async postComment({ id, author, content }: adminValidator.CommentPostValidatorSchema) {
      const entity = await getCommentRepository(strapi).findOne({
        where: { id },
      });
      if (!entity) {
        throw new PluginError(404, 'Not found');
      }
      return getCommentRepository(strapi).create({
        data: {
          content,
          threadOf: id,
          authorId: author.id,
          authorName: getAuthorName(author),
          authorEmail: author.email,
          related: entity.related,
          isAdminComment: true,
        },
      });
    },
    async updateComment({ id, content }: adminValidator.UpdateCommentValidatorSchema) {
      const entity = await getCommentRepository(strapi).update({
        where: { id },
        data: { content },
      });
      if (!entity) {
        throw new PluginError(404, 'Not found');
      }
      return this.getCommonService().sanitizeCommentEntity(entity, []);
    },
  });
};
