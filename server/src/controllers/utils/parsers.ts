import { ToBeFixed } from '../../@types-v5';
import PluginError from '../../utils/error';

const assertNotEmpty: <T>(
  value: T | null | undefined,
  customError?: Error,
) => asserts value is T = (value, customError) => {
  if (value) {
    return value;
  }

  throw (
    customError ?? new PluginError(400, 'Non-empty value expected, empty given')
  );
};
// TODO: TBD with @Mateusz
export const flatInput = <T>(payload: T): T => {
  const { 
    relation,
    sort,
    pagination,
    fields,
    omit,
    filters,
    populate = {},
    filterBy,
    filterByValue,
  } = payload as any;
  console.log('query', filters);
  
  const orOperator = (filters?.$or || []).filter(
    (_: ToBeFixed) => !Object.keys(_).includes('removed'),
  );

  let basePopulate = {
    ...populate,
  };

  let threadOfPopulate = {
    threadOf: {
      populate: {
        authorUser: true,
        ...populate,
      },
    },
  };

  // Cover case when someone wants to populate author instead of authorUser
  if (populate.author) {
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
        },
      },
    };
  }

  if (filterBy === 'DATE_CREATED') {
    const date = new Date(filterByValue);

    if (!filterByValue || Number.isNaN(+date)) {
      throw new PluginError(400, 'Invalid date specified in "filterByValue"');
    }

    const start = date.setHours(0, 0, 0, 0);
    const end = date.setHours(23, 59, 59, 999);

    filters.createdAt = {
      $between: [start, end],
    };
  }

  if (filterBy === 'APPROVAL_STATUS') {
    assertNotEmpty(
      filterByValue,
      new PluginError(400, 'Empty "filterByValue" parameter'),
    );

    filters.approvalStatus = filterByValue;
  }

  console.log('filters', filters);

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
  } as unknown as T;
};
