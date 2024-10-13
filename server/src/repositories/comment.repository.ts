import { FindOneParams, Params } from '@strapi/database/dist/entity-manager/types';
import { isEmpty, once, set } from 'lodash';
import { Comment, CoreStrapi, DBQuery, Where } from '../@types-v5';
import { CommentQueryValidatorSchema } from '../validators';
import { getDefaultAuthorPopulate, getModelUid, getOrderBy } from './utils';

export const getCommentRepository = once((strapi: CoreStrapi) => {

  return {
    admin: {
      findAll: async (query: CommentQueryValidatorSchema) => {
        const { _q, orderBy, page, pageSize, filters } = query;
        const defaultWhere = {
          $or: [{ removed: { $eq: false } }, { removed: { $eq: null } }],
        };
        const [operator, direction] = getOrderBy(orderBy);

        const params: DBQuery = {
          orderBy: orderBy ? { [operator]: direction } : undefined,
          where: isEmpty(filters) ? defaultWhere : { ...defaultWhere, ...filters } as Where,
          offset: (page - 1) * pageSize,
          limit: pageSize,
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

        return strapi.query(getModelUid(strapi, 'comment')).findMany({
          ...params,
          count: true,
          populate,
        });
      },
    },
    findMany<T extends Comment = Comment>(params: Params): Promise<T[]> {
      return strapi.query(getModelUid(strapi, 'comment')).findMany(params);
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
