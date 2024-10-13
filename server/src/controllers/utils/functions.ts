import { Id, StringMap, StrapiRequestContext } from "strapi-typed";

import PluginError from "../../utils/error";

type ParseResponse = StringMap<string | number | Id>;

export const parseParams = <T extends ParseResponse>(
  params: StringMap<string | number>
) =>
  Object.keys(params).reduce((prev, curr): T => {
    const value = params[curr];
    const parsedValue = Number(value);
    return {
      ...prev,
      [curr]: isNaN(parsedValue) ? value : parsedValue,
    };
  }, {} as T);

export const throwError = <T extends {} = never>(
  ctx: StrapiRequestContext<T>,
  e: PluginError | Error | unknown
): PluginError | Error | unknown | never => {
  if (e instanceof PluginError) {
    return ctx.throw(e.status, JSON.stringify(e));
  }
  return e;
};
