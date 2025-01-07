import { CoreStrapi } from '../@types';
import { PluginServices } from '../services';


export const getPluginService = <T extends keyof PluginServices>(strapi: CoreStrapi, serviceName: T): PluginServices[T] => {
  return strapi.plugin('comments').service(serviceName);
};
