import { QueryParams, QueryParamsParsed, IStrapi } from "../../types";

declare var strapi: IStrapi;

export const getPluginService = <T>(name: string): T => 
        strapi
            .plugin('comments')
            .service(name);

export const parseParams = (params: QueryParams): QueryParamsParsed => 
        Object.keys(params)
            .reduce((prev: QueryParamsParsed, curr: string) => {
                const value = params[curr];
                const parsedValue = Number(value);
                return {
                    ...prev,
                    [curr]: isNaN(parsedValue) ? value : parsedValue
                };
            }, {});
