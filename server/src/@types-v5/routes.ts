import { Core } from '@strapi/strapi';
import { PluginControllers } from '../controllers';

type KeyofT<T> = Exclude<keyof T, symbol>;
export type Handler<Prefix extends string, T = any> = `${Prefix}.${KeyofT<T>}`;


export type StrapiRoute<ControllerName extends keyof PluginControllers> = Omit<
  Core.Route,
  'handler' | 'info' | 'config'
> & {
  handler: Handler<ControllerName, PluginControllers[ControllerName]>;
  config?: Core.RouteConfig & {
    description?: string;
    tag?: {
      plugin: string;
      name: string;
      actionType: string;
    };
  };
};