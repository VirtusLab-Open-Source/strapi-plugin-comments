import { Params } from '@strapi/database/dist/entity-manager/types';
import { once } from 'lodash';
import { CommentReport, CoreStrapi, Repository } from '../@types-v5';
import { getModelUid } from './utils';

type ResultFindPage = Awaited<ReturnType<Repository['findPage']>>;
export const getReportCommentRepository = once((strapi: CoreStrapi) => {
  return {
    async findAll(query: Params) {
      return strapi.query(getModelUid(strapi, 'comment-report')).findMany(query);
    },
    findPage<T extends CommentReport = CommentReport>(params: Params): Promise<Omit<ResultFindPage, 'results'> & { results: T[] }> {
      return strapi.query(getModelUid(strapi, 'comment-report')).findPage(params);
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