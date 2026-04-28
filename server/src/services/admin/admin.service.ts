import { Id, StrapiContext } from '../../@types';
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
    async findAll({ _q, orderBy, page, pageSize, filters }: adminValidator.CommentFindAllSchema) {
      const params = utils.findAll.createParams(
        orderBy,
        page,
        pageSize,
        _q,
        filters
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
      const defaultAuthorUserPopulate = getDefaultAuthorPopulate(strapi);
      const { pagination, results } = await getReportCommentRepository(strapi).findPage({
        ...params,
        populate:
        {
          related: {
            populate: {
              authorUser: defaultAuthorUserPopulate,
            }
          }
        },
      });

      const reportCommentsIds = results.map((entity) => typeof entity.related === 'object' ? entity.related?.id : null).filter(Boolean);

      const commentsThreads = await getCommentRepository(strapi).findMany({
        where: {
          threadOf: reportCommentsIds,
        },
        populate: ['threadOf'],
        limit: Number.MAX_SAFE_INTEGER,
      });
      const commentWithThreadIds = Array.from(new Set(commentsThreads
        .map(({ threadOf }) => typeof threadOf === 'object' ? threadOf?.id : null)
        .filter(Boolean)),
      );
      const result = results.map((_) => {
        const isCommentWithThread = commentWithThreadIds.includes(_.related?.id);
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
      const levelThreadId = entity.threadOf && typeof entity.threadOf === 'object' ? entity.threadOf.id : null;

      const entitiesOnSameLevel =
        await this.getCommonService().findAllInHierarchy(
          {
            filters: {
              ...defaultWhere,
              ...query,
              threadOf: levelThreadId,
              related: entity.related,
            },
            ...defaultPopulate,
            startingFromId: levelThreadId,
            isAdmin: true,
            limit: Number.MAX_SAFE_INTEGER,
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
      return this.getCommonService().changeBlockedComment(id, forceStatus);
    },
    async deleteComment(id: Id) {
      return getCommentRepository(strapi).update({ where: { id }, data: { removed: true } });
    },
    async blockCommentThread(id: Id, forceStatus?: boolean) {
      return this.getCommonService().changeBlockedCommentThread(id, forceStatus);
    },
    async approveComment(id: Id) {
      return this.getCommonService().approveComment(id);
    },
    async rejectComment(id: Id) {
      return this.getCommonService().rejectComment(id);
    },
    async resolveAbuseReport({
      id: commentId,
      reportId,
    }: adminValidator.CommentResolveAbuseReportValidatorSchema) {
      return this.getCommonService().resolveAbuseReport(commentId, reportId);
    },
    async resolveCommentMultipleAbuseReports({
      id: commentId,
      reportIds: ids,
    }: adminValidator.CommentResolveMultipleAbuseReportsValidatorSchema) {
      return this.getCommonService().resolveCommentMultipleAbuseReports(commentId, ids);
    },
    async resolveAllAbuseReportsForComment(id: Id) {
      return this.getCommonService().resolveAllAbuseReportsForComment(id);
    },
    async resolveAllAbuseReportsForThread(commentId: number) {
      return this.getCommonService().resolveAllAbuseReportsForThread(commentId);
    },
    async resolveMultipleAbuseReports({
      reportIds,
    }: adminValidator.ReportsMultipleAbuseValidator) {
      return this.getCommonService().resolveMultipleAbuseReports(reportIds);
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
          content: this.getCommonService().sanitizeCommentContent(content),
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
        data: { content: this.getCommonService().sanitizeCommentContent(content) },
      });
      if (!entity) {
        throw new PluginError(404, 'Not found');
      }
      return this.getCommonService().sanitizeCommentEntity(entity, []);
    },
  });
};
