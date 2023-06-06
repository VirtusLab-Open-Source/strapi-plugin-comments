import { StrapiDBQueryArgs, StrapiPagination, StrapiResponseMeta, StringMap } from "strapi-typed";
import { CommentModelKeys, ToBeFixed } from "../../../types";
import { REGEX } from "./../../utils/constants";
import { get, set, uniq, isArray, isObject, isString, isNil } from "lodash";

export const parseSortQuery = (
    sort: StringMap<unknown> | undefined, 
    query: StrapiDBQueryArgs<CommentModelKeys> = {}
): StrapiDBQueryArgs<CommentModelKeys> => {
    if (sort && (isString(sort) || isArray(sort))) {
      return {
        ...query,
        orderBy: (isString(sort) ? [sort] : sort)
          .map((_: string) => (REGEX.sorting.test(_) ? _ : `${_}:asc`))
          .reduce((prev: Object, curr: string) => {
            const [type = "asc", ...parts] = curr.split(":").reverse();
            return { ...set(prev, parts.reverse().join("."), type) };
          }, {}) as ToBeFixed,
      };
    }
    return query;
};

export const parseFieldsQuery = (
    fields: ToBeFixed, 
    query: StrapiDBQueryArgs<CommentModelKeys> = {},
    defaultSelect: Array<CommentModelKeys> = []
): StrapiDBQueryArgs<CommentModelKeys> => {
    if (!isNil(fields)) {
        return {
          ...query,
          select: isArray(fields) ? uniq([...fields, ...defaultSelect]) : fields,
        };
      }
    return query;
};

export const parsePaginationsQuery = (
    pagination: StrapiPagination | undefined, 
    query: StrapiDBQueryArgs<CommentModelKeys> = {},
    defaults: any = []
): [StrapiResponseMeta, StrapiDBQueryArgs<CommentModelKeys>] => {
    if (pagination && isObject(pagination)) {
        const parsedpagination: StrapiPagination = Object.keys(pagination).reduce(
          (prev: StrapiPagination, curr: string) => ({
            ...prev,
            [curr]: parseInt(get(pagination, curr)),
          }),
          {}
        );
        const {
          page = 1,
          pageSize = defaults.PAGE_SIZE,
          start = 0,
          limit = defaults.PAGE_SIZE,
        } = parsedpagination;
        const paginationByPage =
          !isNil(parsedpagination?.page) || !isNil(parsedpagination?.pageSize);
  
        const metapagination = paginationByPage
          ? {
              pagination: {
                page,
                pageSize,
              },
            }
          : {
              pagination: {
                start,
                limit,
              },
            };
  
        return [{
          ...metapagination,
        }, {
            ...query,
            offset: paginationByPage ? (page - 1) * pageSize : start,
            limit: paginationByPage ? pageSize : limit,
        }];
      }
    return [{} as StrapiResponseMeta, query];
}
