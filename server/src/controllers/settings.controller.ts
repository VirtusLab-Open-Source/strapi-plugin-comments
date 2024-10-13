import { RequestContext, StrapiContext } from '../@types-v5';
import { getPluginService } from '../utils/getPluginService';
import { throwError } from '../utils/throwError';

const settingsController = ({ strapi }: StrapiContext) => {
  const settingsService = getPluginService(strapi, 'settings');
  return {
    async get(/*ctx: RequestContext*/) {
      // try {
      //   return await settingsService.getConfig();
      // } catch (e) {
      //   throw throwError(ctx, e);
      // }
    },
    async getForSettingsPage(ctx: RequestContext) {
      console.log('getForSettingsPage::',);
      try {
        return await settingsService.getConfig(true);
      } catch (e) {
        throw throwError(ctx, e);
      }
    },
    async update(/*ctx: RequestContext<CommentsPluginConfig>*/) {
      // try {
      //   const config = validateConfig(ctx.request.body);
      //   return await settingsService.update(config);
      // } catch (e) {
      //   throw throwError(ctx, e);
      // }
    },
    async restore(/*ctx: RequestContext*/) {
      // try {
      //   return await settingsService.restore();
      // } catch (e) {
      //   throw throwError(ctx, e);
      // }
    },
    async restart(/*ctx: RequestContext*/) {
      // try {
      //   await settingsService.restart();
      //   return ctx.send({ message: 'Restarted', status: 200 });
      // } catch (e) {
      //   throw throwError(ctx, e);
      // }
    },
  };
};

export type SettingsController = ReturnType<typeof settingsController>;
export default settingsController;