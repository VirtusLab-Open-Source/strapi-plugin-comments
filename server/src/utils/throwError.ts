import { RequestContext } from '../@types';
import PluginError from './PluginError';

export const throwError = (
  ctx: RequestContext,
  e: PluginError | Error | unknown
): PluginError | Error | unknown | never => {
  if (e instanceof PluginError) {
    return ctx.throw(e.status, JSON.stringify(e));
  }
  return e;
};
