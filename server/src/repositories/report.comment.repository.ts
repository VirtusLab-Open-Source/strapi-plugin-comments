import { Params } from '@strapi/database/dist/entity-manager/types';
import { once } from 'lodash';
import { CoreStrapi } from '../@types-v5';
import { ReportResultValidator, reportResultValidator } from '../validators/repositories';
import { getModelUid } from './utils';

export const getReportCommentRepository = once((strapi: CoreStrapi) => {
  return {
    async findPage(params: Params): Promise<ReportResultValidator['findPage']> {
      return strapi.query(getModelUid(strapi, 'comment-report')).findPage(params)
                   .then(reportResultValidator.findPage.parseAsync);
    },
    findMany(params: Params) {
      console.log('findMany', params);
      return strapi.query(getModelUid(strapi, 'comment-report')).findMany(params);
    },
    async update(params: Params): Promise<ReportResultValidator['update']> {
      return strapi.query(getModelUid(strapi, 'comment-report')).update(params)
                   .then(reportResultValidator.update.parseAsync);
    },
    async updateMany(params: Params) {
      return strapi.query(getModelUid(strapi, 'comment-report')).updateMany(params);
    },
    findOne() {},
    delete() {},
    create() {},
  };
});

export type ReportCommentRepository = ReturnType<typeof getReportCommentRepository>;