import { Id, OnlyStrings, StrapiRequestQueryFieldsClause } from "strapi-typed";
import { ToBeFixed } from "../../../types";

export const flatInput = <T, TKeys = keyof T>(
  relation: Id,
  query: ToBeFixed,
  sort: ToBeFixed,
  pagination?: ToBeFixed,
  fields?: StrapiRequestQueryFieldsClause<OnlyStrings<TKeys>>,
) => {
  const filters = query?.filters || query;
  const orOperator = (filters?.$or || []).filter(
    (_: ToBeFixed) => !Object.keys(_).includes("removed")
  );
  return {
    query: {
      ...filters,
      $or: [...orOperator, { removed: { $null: true } }, { removed: false }],
      related: relation,
    },
    populate: {
      threadOf: {
        populate: { authorUser: true },
      },
    },
    pagination,
    sort,
    fields,
  };
};
