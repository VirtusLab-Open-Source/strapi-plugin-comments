import { client } from '../../validators/api';
import { omit as omitLodash } from 'lodash';

// Define base interface for filters
interface BaseFilters {
  $or?: Record<string, any>[];
  content?: any;
  authorName?: any;
  createdAt?: any;
  approvalStatus?: any;
  [key: string]: any;
}

// Union type of all possible input types
type FlatInputParams =
  | client.FindAllFlatSchema
  | client.FindAllInHierarchyValidatorSchema
  | client.FindAllPerAuthorValidatorSchema;

export const flatInput = <T extends FlatInputParams>(payload: T): T => {
  const {
    sort,
    fields,
    omit,
    filters = {} as BaseFilters,
    populate = {},
    relation,
    pagination,
  } = payload as FlatInputParams & {
    filters?: BaseFilters;
    populate?: Record<string, boolean | { populate: boolean }>;
    pagination?: client.FindAllFlatSchema['pagination'];
    relation?: client.FindAllFlatSchema['relation'];
  };

  const orOperator = (filters.$or || []).filter(
    (item) => !Object.keys(item).includes('removed')
  );
  const hasRemoved = filters.$or?.some((item) => item.removed);

  let basePopulate = {
    ...populate,
  };

  let threadOfPopulate = {
    threadOf: {
      populate: {
        authorUser: true,
        ...populate,
      } as {
        authorUser: boolean | { populate: boolean };
        [key: string]: boolean | { populate: boolean };
      },
    },
  };

  // Cover case when someone wants to populate author instead of authorUser
  if ('author' in populate) {
    const { author, ...restPopulate } = populate;
    basePopulate = {
      ...restPopulate,
      authorUser: author,
    };
    threadOfPopulate = {
      threadOf: {
        populate: {
          authorUser: author,
          ...restPopulate,
        } as {
          authorUser: boolean | { populate: boolean };
          [key: string]: boolean | { populate: boolean };
        },
      },
    };
  }
  if (orOperator.length && !hasRemoved) {
    return {
      ...payload,
      filters: {
        ...omitLodash(filters, '$or'),
        $and: [
          ...(filters.$and || []),
          { $or: orOperator },
          { $or: [{ removed: { $null: true } }, { removed: false }] },
        ],
        related: relation,
      },
      populate: {
        ...basePopulate,
        ...threadOfPopulate,
      },
      pagination,
      sort,
      fields,
      omit,
    } as T;
  }

  return {
    ...payload,
    filters: {
      ...filters,
      $or: [...orOperator, { removed: { $null: true } }, { removed: false }],
      related: relation,
    },
    populate: {
      ...basePopulate,
      ...threadOfPopulate,
    },
    pagination,
    sort,
    fields,
    omit,
  } as T;
};
