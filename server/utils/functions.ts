import { StrapiQueryParams, StrapiQueryParamsParsed, IStrapi } from "strapi-typed";

declare var strapi: IStrapi;

export const getPluginService = <T>(name: string): T => 
        strapi
            .plugin('comments')
            .service(name);

export const parseParams = <T = StrapiQueryParamsParsed>(params: StrapiQueryParams): T => 
        Object.keys(params)
            .reduce((prev: T, curr: string) => {
                const value = params[curr];
                const parsedValue = Number(value);
                return {
                    ...prev,
                    [curr]: isNaN(parsedValue) ? value : parsedValue
                };
            }, {} as T);
