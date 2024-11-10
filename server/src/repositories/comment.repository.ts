import { FindOneParams, Params } from '@strapi/database/dist/entity-manager/types';
import { once } from 'lodash';
import { CoreStrapi } from '../@types-v5';
import { getConfig } from '../utils/getConfig';
import { CommentResultValidator, commentResultValidator } from '../validators/repositories';
import { shouldValidateArray, shouldValidateObject } from '../validators/repositories/utils';
import { getModelUid } from './utils';

export const getCommentRepository = once((strapi: CoreStrapi) => {
  const modelUid = getModelUid(strapi, 'comment');
  return {
    async findMany(params: Params): Promise<CommentResultValidator['findMany']> {
      const isValidationEnabled = await getConfig(strapi, 'isValidationEnabled', false);
      return strapi.query(modelUid).findMany(params)
                   .then(shouldValidateArray(isValidationEnabled, commentResultValidator.findMany));
    },
    async findWithCount(params: Params): Promise<CommentResultValidator['findWithCount']> {
      const isValidationEnabled = await getConfig(strapi, 'isValidationEnabled', false);
      return strapi.query(modelUid).findPage(params)
                   .then(shouldValidateObject(isValidationEnabled, commentResultValidator.findWithCount));
    },
    async findOne(params: FindOneParams): Promise<CommentResultValidator['findOne'] | null> {
      const isValidationEnabled = await getConfig(strapi, 'isValidationEnabled', false);
      return strapi.query(modelUid).findOne(params)
                   .then(result => (result ? shouldValidateObject(isValidationEnabled, commentResultValidator.findOne)(result) : null));
    },
    async update(params: Params): Promise<CommentResultValidator['findOne']> {
      const isValidationEnabled = await getConfig(strapi, 'isValidationEnabled', false);
      return strapi.query(modelUid).update(params)
                   .then(shouldValidateObject(isValidationEnabled, commentResultValidator.findOne));
    },
    async delete(params: Params): Promise<CommentResultValidator['findOne'] | null> {
      const isValidationEnabled = await getConfig(strapi, 'isValidationEnabled', false);
      return strapi.query(modelUid).delete(params)
                   .then(result => (result ? shouldValidateObject(isValidationEnabled, commentResultValidator.findOne)(result) : null));
    },
    updateMany(params: Params) {
      return strapi.query(modelUid).updateMany(params);
    },
    async create(params: Pick<Params, 'data' | 'populate'>): Promise<CommentResultValidator['create']> {
      const isValidationEnabled = await getConfig(strapi, 'isValidationEnabled', false);
      return strapi.query(modelUid).create(params)
                   .then(shouldValidateObject(isValidationEnabled, commentResultValidator.create));
    },

  };
});

export type CommentRepository = ReturnType<typeof getCommentRepository>;
