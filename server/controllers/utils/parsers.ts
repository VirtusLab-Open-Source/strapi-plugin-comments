import { OnlyStrings } from "strapi-typed";
import { FlatInput, ToBeFixed } from "../../../types";

export const flatInput = <T, TKeys = keyof T>(
  payload: FlatInput<OnlyStrings<TKeys>>
) => {
  const { relation, query, sort, pagination, fields } = payload;

  const { populate = {}, ...restQuery } = query;
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
