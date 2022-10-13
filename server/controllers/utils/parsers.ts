import { OnlyStrings } from "strapi-typed";
import { FlatInput, ToBeFixed } from "../../../types";
import PluginError from "../../utils/error";
import { assertNotEmpty } from "../../utils/functions";

export const flatInput = <T, TKeys = keyof T>(
  payload: FlatInput<OnlyStrings<TKeys>>
) => {
  const { relation, query, sort, pagination, fields } = payload;

  const { populate = {}, filterBy, filterByValue, ...restQuery } = query;
  const filters = restQuery?.filters || restQuery;
  const orOperator = (filters?.$or || []).filter(
    (_: ToBeFixed) => !Object.keys(_).includes("removed")
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

  if (filterBy === "DATE_CREATED") {
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

  if (filterBy === "APPROVAL_STATUS") {
    assertNotEmpty(
      filterByValue,
      new PluginError(400, 'Empty "filterByValue" parameter')
    );

    filters.approvalStatus = filterByValue;
  }

  return {
    query: {
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
  };
};
