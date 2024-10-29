import { FindOneParams, Params } from '@strapi/database/dist/entity-manager/types';
import { once } from 'lodash';
import { Comment, CoreStrapi } from '../@types-v5';
import { CommentResultValidator, commentResultValidator } from '../validators/repositories';
import { getModelUid } from './utils';

export const getCommentRepository = once((strapi: CoreStrapi) => {
  const modelUid = getModelUid(strapi, 'comment');

  return {
    async findMany(params: Params): Promise<CommentResultValidator['findMany']> {
      return strapi.query(modelUid).findMany(params)
                   .then(commentResultValidator.findMany.parseAsync);
    },
    async findWithCount(params: Params): Promise<CommentResultValidator['findWithCount']> {
      return strapi.query(modelUid).findPage(params)
                   .then(commentResultValidator.findWithCount.parseAsync);
    },
    async findOne(params: FindOneParams): Promise<CommentResultValidator['findOne']> {
      return strapi.query(modelUid).findOne(params)
                   .then(result => (result ? commentResultValidator.findOne.parseAsync(result) : null));
    },
    async update(params: Params): Promise<CommentResultValidator['findOne']> {
      return strapi.query(modelUid).update(params)
                   .then(commentResultValidator.findOne.parseAsync);
    },
    async delete(params: Params): Promise<CommentResultValidator['findOne'] | null> {
      return strapi.query(modelUid).delete(params)
                   .then(result => (result ? commentResultValidator.findOne.parseAsync(result) : null));
    },
    updateMany(params: Params) {
      return strapi.query(modelUid).updateMany(params);
    },
    async create(params: Pick<Params, 'data' | 'populate'>): Promise<CommentResultValidator['create']> {
      return strapi.query(modelUid).create(params).then(commentResultValidator.create.parseAsync);
    },

  };
});

export type CommentRepository = ReturnType<typeof getCommentRepository>;
