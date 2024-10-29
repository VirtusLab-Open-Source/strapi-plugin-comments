import { Core } from '@strapi/strapi';
import { PluginControllers } from '../controllers';

type PathToFunction<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? K & string
    : T[K] extends object
      ? `${K & string}.${PathToFunction<T[K]>}`
      : never;
}[keyof T];
export type Handler<Prefix extends string, Controller extends object> = `${Prefix}.${PathToFunction<Controller>}`;


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