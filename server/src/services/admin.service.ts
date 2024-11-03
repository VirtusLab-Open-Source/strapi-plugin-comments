import { isEmpty, isNil, set } from 'lodash';
import { DBQuery, Id, StrapiContext, Where } from '../@types-v5';
import { APPROVAL_STATUS } from '../const';
import { getCommentRepository, getDefaultAuthorPopulate, getOrderBy, getReportCommentRepository } from '../repositories';
import { getPluginService } from '../utils/getPluginService';
import PluginError from '../utils/PluginError';

import { admin as adminValidator } from '../validators/api';
import { filterOurResolvedReports, getAuthorName } from './utils/functions';

/**
 * Comments Plugin - Moderation services
 */

export default ({ strapi }: StrapiContext) => ({
  getCommonService() {
    return getPluginService(strapi, 'common');
  },

  // Find all comments
  async findAll({ _q, orderBy, page, pageSize, filters }: adminValidator.CommentQueryValidatorSchema) {
    const defaultWhere = {
      $or: [{ removed: { $eq: false } }, { removed: { $eq: null } }],
    };
    const [operator, direction] = getOrderBy(orderBy);

    const params: Partial<DBQuery> = {
      orderBy: orderBy ? { [operator]: direction } : undefined,
      where: isEmpty(filters)
        ? defaultWhere
        : ({ ...defaultWhere, ...filters } as Where),
      page,
      pageSize,
    };
    if (_q) {
      set(params, 'where.content.$contains', _q);
    }
    const populate = {
      authorUser: getDefaultAuthorPopulate(strapi),
      threadOf: true,
      reports: {
        where: {
          resolved: false,
        },
      },
    };
    const { pagination, results } = await getCommentRepository(
      strapi,
    ).findWithCount({
      ...params,
      count: true,
      populate,
    });
    const relatedEntities = await this.getCommonService().findRelatedEntitiesFor(results);
    return {
      pagination,
      result: results
      .map((_) => this.getCommonService().sanitizeCommentEntity(_, [], []))
      .map(_ => this.getCommonService().mergeRelatedEntityTo(_, relatedEntities)),
    };
  },

  async findReports({ _q, orderBy, filters, page, pageSize }: adminValidator.ReportQueryValidatorSchema) {
    const defaultWhere: Where = {
      resolved: { $notNull: true },
    };
    const [operator, direction] = getOrderBy(orderBy);
    const params = {
      _q,
      orderBy: orderBy ?? { [operator]: direction },
      where: isEmpty(filters) ? defaultWhere : { ...defaultWhere, ...filters } as Where,
      page,
      pageSize,
    };

    if (_q) {
      set(params, 'where.content.$contains', _q);
    }
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
      return filterOurResolvedReports(
        commonService.sanitizeCommentEntity(
          entity,
          [],
          [],
          typeof defaultAuthorUserPopulate !== 'boolean'
            ? defaultAuthorUserPopulate?.populate
            : {},
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
    const defaultWhere: any = !removed ? { $or: [{ removed: false }, { removed: { $notNull: false } }] } : {};
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
    const defaultPopulate: any = {
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
    };

    const entity = await getCommentRepository(strapi).findOne({
      where: {
        id,
      },
      ...defaultPopulate,
    });

    if (!entity) {
      throw new PluginError(404, 'Not found');
    }

    const { relatedId, uid } = this.getCommonService().parseRelationString(entity.related);
    const relatedEntity = await strapi.entityService
                                      .findOne(uid, relatedId)
                                      .then((_) => {
                                        if (!_) {
                                          throw new PluginError(404, 'Relation not found');
                                        }
                                        return { ..._, uid };
                                      });
    const levelThreadId = typeof entity.threadOf === 'object' ? entity.threadOf.id : null;

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

    const selectedEntity = this.getCommonService().sanitizeCommentEntity(
      {
        ...entity,
        threadOf: entity.threadOf || null,
      },
      [],
      [],
      typeof defaultAuthorUserPopulate !== 'boolean'
        ? defaultAuthorUserPopulate?.populate
        : {},
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
  }: adminValidator.ResolveAbuseReportValidatorSchema) {
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
  }: adminValidator.ResolveCommentMultipleAbuseReportsValidatorSchema) {
    const reports = await getReportCommentRepository(strapi).findMany({
      where: {
        id: ids,
        related: commentId,
      },
      populate: ['related'],
    });
    console.log('reports', reports);

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
  async resolveAllAbuseReportsForThread(commentId: number) {
    if (!commentId) {
      throw new PluginError(
        400,
        'There is something wrong with comment Id. Try again.',
      );
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
  async resolveMultipleAbuseReports({
    reportIds,
  }: adminValidator.MultipleAbuseReportsValidatorSchema) {
    return getReportCommentRepository(strapi).updateMany({
      where: {
        id: { $in: reportIds },
      },
      data: {
        resolved: true,
      },
    });
  },
  async postComment({ id, author, content }: adminValidator.PostCommentValidatorSchema) {
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
