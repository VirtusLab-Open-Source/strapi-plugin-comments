import { Core } from '@strapi/strapi';
import { Context } from 'koa';

export type AdminUser = {
  id: string | number;
  email: string;
  username: string;
};
export type RequestContext<Body = object, PathParams = object, QueryParams = object> = Omit<
  Context,
  'body' | 'query' | 'request'
> & {
  body: Body;
  query: QueryParams;
  params: PathParams;
  request: Omit<Context['request'], 'body'> & {
    body: Body;
  };
  state: {
    user?: AdminUser;
  };
};
