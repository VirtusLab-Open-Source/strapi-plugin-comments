import { Params } from '@strapi/database/dist/entity-manager/types';
import { isEmpty, once, set } from 'lodash';
import { CommentReport, CoreStrapi, DBQuery, Where } from '../@types-v5';
import { ReportQueryValidatorSchema } from '../validators';
import { getModelUid, getOrderBy } from './utils';

export const getReportCommentRepository = once((strapi: CoreStrapi) => {
  return {
    // TODO: extract business logic to service
    async findAll(query: ReportQueryValidatorSchema) {
      const { _q, orderBy, page, pageSize, filters } = query;
      const defaultWhere: Where = {
        resolved: { $notNull: true },
      };
      const [operator, direction] = getOrderBy(orderBy);
      const params: DBQuery = {
        _q,
        orderBy: orderBy ?? { [operator]: direction },
        where: isEmpty(filters) ? defaultWhere : { ...defaultWhere, ...filters } as Where,
        offset: (page - 1) * pageSize,
        limit: pageSize,
      };

      if (_q) {
        set(params, 'where.content.$contains', _q);
      }

      const reportUID = getModelUid(strapi, 'comment-report');

      const entities = await strapi.query(reportUID).findMany({
        ...params,
        populate: ['related'],
      });

      const total = await strapi.query(reportUID).count({
        where: params.where,
      });

      const reportCommentsIds = entities.map((entity) => entity.related.id);

      const commentsThreads = await strapi.query(getModelUid(strapi, 'comment')).findMany({
        where: {
          threadOf: reportCommentsIds,
        },
        populate: ['threadOf'],
        limit: Number.MAX_SAFE_INTEGER,
      });
      const commentWithThreadIds = Array.from(new Set(commentsThreads.map(({ threadOf }) => threadOf.id)));

      return {
        total,
        entities,
        commentWithThreadIds,
      };
    },
    findMany<T extends CommentReport = CommentReport>(params: Params): Promise<T[]> {
      return strapi.query(getModelUid(strapi, 'comment-report')).findMany(params);
    },
    findOne() {},
    update<T extends CommentReport = CommentReport>(params: Params): Promise<T | null> {
      return strapi.query(getModelUid(strapi, 'comment-report')).update(params);
    },
    updateMany(params: Params) {
      return strapi.query(getModelUid(strapi, 'comment-report')).updateMany(params);
    },
    delete() {},
    create() {},
  };
});

export type ReportCommentRepository = ReturnType<typeof getReportCommentRepository>;