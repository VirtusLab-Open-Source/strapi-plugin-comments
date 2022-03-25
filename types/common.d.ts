import { Map } from "strapi-typed";

export type ToBeFixed = any;

export type StrapiRequestContext<TBody = {}, TQuery = {}> = {
    request: StrapiRequest<TBody>
    query: TQuery
    params: Map<string | number>
    
    send: Function
    throw: Function
}

export type StrapiRequest<TBody extends Object> = {
    body?: SettingsCommentsPluginConfig
};