import { Comment, Id, StrapiContext } from '../@types-v5';
import { APPROVAL_STATUS } from '../const';
import { getCommentRepository, getDefaultAuthorPopulate, getReportCommentRepository } from '../repositories';
import { getModelUid } from '../repositories/utils';
import { getPluginService } from '../utils/getPluginService';
import PluginError from '../utils/PluginError';

import { CommentQueryValidatorSchema, FindOneValidatorSchema, PostCommentValidatorSchema, ReportQueryValidatorSchema, ResolveAbuseReportValidatorSchema, ResolveCommentMultipleAbuseReportsValidatorSchema, UpdateCommentValidatorSchema } from '../validators';
import { filterOurResolvedReports, getAuthorName } from './utils/functions';

/**
 * Comments Plugin - Moderation services
 */

export default ({ strapi }: StrapiContext) => ({
  getCommonService() {
    return getPluginService(strapi, 'common');
  },

  // Find all comments
  async findAll(query: CommentQueryValidatorSchema) {
    return getCommentRepository(strapi).admin.findAll(query);
  },

  async findReports(query: ReportQueryValidatorSchema) {
    const { total, commentWithThreadIds, entities } = await getReportCommentRepository(strapi).findAll(query);
    const defaultAuthorUserPopulate = getDefaultAuthorPopulate(strapi);

    const result = entities.map((_) => {
      const isCommentWithThread = commentWithThreadIds.includes(_.related.id);
      const commonService = this.getCommonService();

      const entity = {
        ..._,
        related: commonService.sanitizeCommentEntity({
          ..._.related,
          gotThread: isCommentWithThread,
        }, []),
      };
      return filterOurResolvedReports(
        commonService.sanitizeCommentEntity(entity, [], [], typeof defaultAuthorUserPopulate !== 'boolean' ? defaultAuthorUserPopulate?.populate : {}),
      );
    });

    const pageCount = Math.floor(total / query.pageSize);

    return {
      result,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        pageCount: total % query.pageSize === 0 ? pageCount : pageCount + 1,
        total,
      },
    };

  },
  async findOneAndThread({ id, removed, ...query }: FindOneValidatorSchema) {
    const defaultAuthorUserPopulate = getDefaultAuthorPopulate(strapi);
    const defaultWhere = !removed ? { $or: [{ removed: false }, { removed: { $notNull: false } }] } : {};
    const reportsPopulation = {
      reports: {
        where: {
          resolved: false,
        },
      },
    };
    const basePopulate = {
      populate: {
        threadOf: {
          populate: {
            ...reportsPopulation,
          },
        },
        ...reportsPopulation,
      },
    };
    // TODO: explain with @mateusz
    const defaultPopulate = defaultAuthorUserPopulate ? {
      populate: {
        ...basePopulate.populate,
        authorUser: defaultAuthorUserPopulate,
        threadOf: {
          populate: {
            ...basePopulate.populate.threadOf.populate,
            authorUser: defaultAuthorUserPopulate,
          },
        },
      },
    } : basePopulate;

    const entity = await strapi.query(getModelUid(strapi, 'comment')).findOne({
      where: {
        id,
      },
      ...defaultPopulate,
    });

    if (!entity) {
      throw new PluginError(404, 'Not found');
    }

    const { relatedId, uid } = this.getCommonService().parseRelationString(entity.related);
    const relatedEntity = await strapi.entityService.findOne(uid, relatedId)
    .then((_) => {
      if (!_) {
        throw new PluginError(404, 'Relation not found');
      }
      return ({ ..._, uid });
    });
    const levelThreadId = (entity?.threadOf as Comment)?.id || null;

    const entitiesOnSameLevel = await this.getCommonService().findAllInHierarchy(
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

    const selectedEntity = this.getCommonService().sanitizeCommentEntity(
      {
        ...entity,
        threadOf: entity.threadOf || null,
      },
      [],
      [],
      typeof defaultAuthorUserPopulate !== 'boolean' ? defaultAuthorUserPopulate?.populate : {},
    );


    return {
      entity: relatedEntity,
      selected: selectedEntity,
      level: entitiesOnSameLevel,
    };
  },
  async changeBlockedComment(id: Id, forceStatus?: boolean) {
    const entry = await this.getCommonService().findOne({ id });
    return this.getCommonService().updateComment({ id }, { blocked: forceStatus || !entry.blocked });
  },
  async deleteComment(id: Id) {
    return getCommentRepository(strapi).delete({ where: { id } });
  },
  async blockCommentThread(id: Id, forceStatus?: boolean) {
    const entry = await this.getCommonService().findOne({ id });
    const status = forceStatus || !entry.blocked;
    const updatedEntry = await this.getCommonService()
    .updateComment({ id }, { blocked: status, blockedThread: status });
    await this.blockNestedThreads(id, status);
    return this.getCommonService().sanitizeCommentEntity(updatedEntry, []);
  },
  async approveComment(id: Id) {
    const entity = await getCommentRepository(strapi).update({ where: { id }, data: { approvalStatus: APPROVAL_STATUS.APPROVED }});
    if (!entity) {
      throw new PluginError(404, 'Not found');
    }
    return this.getCommonService().sanitizeCommentEntity(entity, []);
  },
  async rejectComment(id: Id) {
    const entity = await getCommentRepository(strapi).update({ where: { id }, data: { approvalStatus: APPROVAL_STATUS.REJECTED }});
    if (!entity) {
      throw new PluginError(404, 'Not found');
    }
    return this.getCommonService().sanitizeCommentEntity(entity, []);
  },
  async blockNestedThreads(id: Id, status: boolean) {
    return this.getCommonService().modifiedNestedNestedComments(id, 'blockedThread', status);
  },
  async resolveAbuseReport({ id: commentId, reportId }: ResolveAbuseReportValidatorSchema) {
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
  async resolveCommentMultipleAbuseReports({ id: commentId, reportIds: ids }: ResolveCommentMultipleAbuseReportsValidatorSchema) {
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
      throw new PluginError(400, 'There is something wrong with comment Id. Try again.');
    }
    // TODO: explain with @mateusz and test
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
  async resolveAllAbuseReportsForThread(commentId: Id) {
    if (!commentId) {
      throw new PluginError(400, 'There is something wrong with comment Id. Try again.');
    }
    // TODO: explain with @mateusz and test
    const commentsInThread = await getCommentRepository(strapi).findMany({
      where: {
        threadOf: commentId,
      },
      select: ['id'],
    });
    return getReportCommentRepository(strapi).updateMany({
      // TODO: tests update many allow update only by ids?
      where: {
        related: commentsInThread.map(({ id }) => id).concat([commentId]),
        resolved: false,
      },
      data: {
        resolved: true,
      },
    });

  },
  async resolveMultipleAbuseReports({ reportIds }: ResolveCommentMultipleAbuseReportsValidatorSchema) {
    return getReportCommentRepository(strapi).updateMany({
      where: {
        id: { $in: reportIds },
      },
      data: {
        resolved: true,
      },
    });
  },
  async postComment({ id, author, content }: PostCommentValidatorSchema) {
    const entity = await getCommentRepository(strapi).findOne({ where: { id } });
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
  async updateComment({ id, content }: UpdateCommentValidatorSchema) {
    const entity = await getCommentRepository(strapi).update({ where: { id }, data: { content } });
    if (!entity) {
      throw new PluginError(404, 'Not found');
    }
    return this.getCommonService().sanitizeCommentEntity(entity, []);
  },
});