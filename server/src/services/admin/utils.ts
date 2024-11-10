import { isEmpty, once, set } from 'lodash';
import { CoreStrapi, DBQuery, Where } from '../../@types-v5';
import { getDefaultAuthorPopulate, getOrderBy } from '../../repositories';
import { admin as adminValidator } from '../../validators/api';

export const getAdminServiceUtils = once((strapi: CoreStrapi) => {
  return {
    findAll: {
      getDefaultWhere() {
        return {
          $or: [{ removed: { $eq: false } }, { removed: { $eq: null } }],
        };
      },
      createParams(
        orderBy: adminValidator.CommentQueryValidatorSchema['orderBy'],
        filters: adminValidator.CommentQueryValidatorSchema['filters'],
        page: adminValidator.CommentQueryValidatorSchema['page'],
        pageSize: adminValidator.CommentQueryValidatorSchema['pageSize'],
        _q: adminValidator.CommentQueryValidatorSchema['_q'],
        defaultWhere: Where,
      ) {
        const [operator, direction] = getOrderBy(orderBy);
        const params: Partial<DBQuery> = {
          orderBy: orderBy ? { [operator]: direction } : undefined,
          where: isEmpty(filters) ? defaultWhere : ({ ...defaultWhere, ...filters } as Where),
          page,
          pageSize,
        };
        if (_q) {
          set(params, 'where.content.$contains', _q);
        }
        return params;
      },
      getPopulate() {
        return {
          authorUser: getDefaultAuthorPopulate(strapi),
          threadOf: true,
          reports: {
            where: {
              resolved: false,
            },
          },
        };
      },
    },
    findReports: {
      getDefaultWhere(): Where {
        return {
          resolved: {
            $notNull: true,
          },
        };
      },
      createParams(
        orderBy: adminValidator.CommentQueryValidatorSchema['orderBy'],
        filters: adminValidator.CommentQueryValidatorSchema['filters'],
        page: adminValidator.CommentQueryValidatorSchema['page'],
        pageSize: adminValidator.CommentQueryValidatorSchema['pageSize'],
        _q: adminValidator.CommentQueryValidatorSchema['_q'],
        defaultWhere: Where,
      ) {
        const [operator, direction] = getOrderBy(orderBy);
        const params: Partial<DBQuery> = {
          orderBy: orderBy ? { [operator]: direction } : undefined,
          where: isEmpty(filters) ? defaultWhere : ({ ...defaultWhere, ...filters } as Where),
          page,
          pageSize,
        };
        if (_q) {
          set(params, 'where.content.$contains', _q);
        }
        return params;
      },
    },
    findOneAndThread: {
      getDefaultWhere(removed?: boolean) {
        return removed ? { $or: [{ removed: false }, { removed: { $notNull: false } }] } : {};
      },
      getPopulate() {
        const defaultAuthorUserPopulate = getDefaultAuthorPopulate(strapi);
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
        return {
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
      },
    },
  };
});
