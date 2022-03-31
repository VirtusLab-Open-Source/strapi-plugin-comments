import {
  StrapiQueryParams,
  StrapiQueryParamsParsed,
  IStrapi,
} from "strapi-typed";
import PluginError from "./error";

declare var strapi: IStrapi;

export const getPluginService = <T>(name: string): T =>
  strapi.plugin("comments").service(name);

export const parseParams = <T = StrapiQueryParamsParsed>(
  params: StrapiQueryParams
): T =>
  Object.keys(params).reduce((prev: T, curr: string) => {
    const value = params[curr];
    const parsedValue = Number(value);
    return {
      ...prev,
      [curr]: isNaN(parsedValue) ? value : parsedValue,
    };
  }, {} as unknown as T);

export const assertParamsPresent: <T>(
  params: unknown,
  keys: string[]
) => asserts params is T = (params, keys) => {
  const missingParams =
    params instanceof Object
      ? keys.filter((key) => !params.hasOwnProperty(key))
      : keys;

  if (missingParams.length === 0) {
    return;
  }

  throw new PluginError(
    400,
    `Expected params missing: ${missingParams.join(", ")}`
  );
};

export const assertNotEmpty: <T>(
  value: T | null | undefined,
  customError?: Error
) => asserts value is T = (value, customError) => {
  if (value) {
    return;
  }

  throw (
    customError ?? new PluginError(400, "Non-empty value expected, empty given")
  );
};
