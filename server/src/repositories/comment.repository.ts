import { FindOneParams, Params } from '@strapi/database/dist/entity-manager/types';
import { once } from 'lodash';
import { Comment, CoreStrapi, Repository } from '../@types-v5';
import { getModelUid } from './utils';

type ResultFindPage = Awaited<ReturnType<Repository['findPage']>>;
export const getCommentRepository = once((strapi: CoreStrapi) => {

  return {
    findMany<T extends Comment = Comment>(params: Params): Promise<T[]> {
      return strapi.query(getModelUid(strapi, 'comment')).findMany(params);
    },
    findWithCount<T extends Comment = Comment>(params: Params): Promise<Omit<ResultFindPage, 'results'> & { results: T[] }> {
      return strapi.query(getModelUid(strapi, 'comment')).findPage(params);
    },
    findOne<T extends Comment = Comment>(params: FindOneParams): Promise<T | null> {
      return strapi.query(getModelUid(strapi, 'comment')).findOne(params);
    },
    update<T extends Comment = Comment>(params: Params): Promise<T> {
      return strapi.query(getModelUid(strapi, 'comment')).update(params);
    },
    delete<T extends Comment = Comment>(params: Params): Promise<T | null> {
      return strapi.query(getModelUid(strapi, 'comment')).delete(params);
    },
    updateMany(params: Params) {
      return strapi.query(getModelUid(strapi, 'comment')).updateMany(params);
    },
    create<T extends Comment = Comment>(params: Pick<Params, 'data'>): Promise<T> {
      return strapi.query(getModelUid(strapi, 'comment')).create(params);
    },

  };
});

export type CommentRepository = ReturnType<typeof getCommentRepository>;
