import { Params } from '@strapi/database/dist/entity-manager/types';
import { once } from 'lodash';
import { CoreStrapi } from '../@types-v5';
import { getConfig } from '../utils/getConfig';
import { ReportResultValidator, reportResultValidator } from '../validators/repositories';
import { shouldValidateObject } from '../validators/repositories/utils';
import { getModelUid } from './utils';

export const getReportCommentRepository = once((strapi: CoreStrapi) => {
  const modelUid = getModelUid(strapi, 'comment-report');
  const repository = strapi.query(modelUid);

  return {
    async findPage(params: Params): Promise<ReportResultValidator['findPage']> {
      const isValidationEnabled = await getConfig(strapi, 'isValidationEnabled', false);
      return repository.findPage(params)
                       .then(shouldValidateObject(isValidationEnabled, reportResultValidator.findPage));
    },
    async findMany(params: Params) {
      console.log('findMany', params);
      const isValidationEnabled = await getConfig(strapi, 'isValidationEnabled', false);
      return repository.findMany(params);
    },
    async update(params: Params): Promise<ReportResultValidator['update']> {
      const isValidationEnabled = await getConfig(strapi, 'isValidationEnabled', false);
      return repository.update(params)
                       .then(shouldValidateObject(isValidationEnabled, reportResultValidator.update));
    },
    async updateMany(params: Params) {
      return repository.updateMany(params);
    },
    async create(params: Params) {
      const isValidationEnabled = await getConfig(strapi, 'isValidationEnabled', false);
      return repository.create(params)
                       .then(shouldValidateObject(isValidationEnabled, reportResultValidator.create));
    },
  };
});

export type ReportCommentRepository = ReturnType<typeof getReportCommentRepository>;
