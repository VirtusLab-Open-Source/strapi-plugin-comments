import PluginError from '../../utils/error';
import { client } from '../../validators/api';

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
type FlatInputParams = client.FindAllFlatSchema | client.FindAllInHierarchyValidatorSchema | client.FindAllPerAuthorValidatorSchema;

const assertNotEmpty = <T>(value: T | null | undefined, customError?: Error): asserts value is T => {
  if (value) return;
  throw customError ?? new PluginError(400, 'Non-empty value expected, empty given');
};

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
    (item) => !Object.keys(item).includes('removed'),
  );

  let basePopulate = {
    ...populate,
  };

  let threadOfPopulate = {
    threadOf: {
      populate: {
        authorUser: true,
        ...populate,
      } as { authorUser: boolean | { populate: boolean }, [key: string]: boolean | { populate: boolean } },
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
        } as { authorUser: boolean | { populate: boolean }, [key: string]: boolean | { populate: boolean } },
      },
    };
  }

  const updatedFilters = { ...filters };

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
