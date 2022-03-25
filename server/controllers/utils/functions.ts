import { Id, Map } from "strapi-typed";
import { StrapiRequestContext } from "../../../types";

import PluginError from "../../utils/error";

type ParseResponse = Map<string | number | Id>;

export const parseParams = (params: Map<string | number>) => Object.keys(params).reduce((prev, curr): ParseResponse => {
  const value = params[curr];
  const parsedValue = Number(value);
  return {
    ...prev,
    [curr]: isNaN(parsedValue) ? value : parsedValue
  };
}, {} as ParseResponse);

export const throwError = (ctx: StrapiRequestContext, e: PluginError | Error | unknown): PluginError | Error | unknown | never => {
  if (e instanceof PluginError){
    return ctx.throw(e.status, JSON.stringify(e));
  }
  return e;
};
