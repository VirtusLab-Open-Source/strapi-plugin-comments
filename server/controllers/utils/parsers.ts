import { OnlyStrings } from "strapi-typed";
import { FlatInput, ToBeFixed } from "../../../types";

export const flatInput = <T, TKeys = keyof T>(payload: FlatInput<OnlyStrings<TKeys>>) => {
  const { 
    relation,
    query,
    sort,
    pagination,
    fields
  } = payload;

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
