import { RequestContext, StrapiContext } from '../@types-v5';
import { CommentsPluginConfig } from '../config';
import { isRight, unwrapEither } from '../utils/Either';
import { getPluginService } from '../utils/getPluginService';
import { throwError } from '../utils/throwError';
import { validateConfig } from '../validators/api/controllers/settings.controller.validator';

const settingsController = ({ strapi }: StrapiContext) => {
  const settingsService = getPluginService(strapi, 'settings');
  return {
    async get(ctx: RequestContext) {
      try {
        return await settingsService.getConfig();
      } catch (e) {
        throw throwError(ctx, e);
      }
    },
    async getForSettingsPage(ctx: RequestContext) {
      try {
        return await settingsService.getConfig(true);
      } catch (e) {
        throw throwError(ctx, e);
      }
    },
    async update(ctx: RequestContext<CommentsPluginConfig>) {
      const config = validateConfig(ctx.request.body);
      if (isRight(config)) {
        return await settingsService.update(unwrapEither(config));
      }
      throw throwError(ctx, unwrapEither(config));
    },
    async restore(ctx: RequestContext) {
      try {
        return await settingsService.restore();
      } catch (e) {
        throw throwError(ctx, e);
      }
    },
    async restart(ctx: RequestContext) {
      try {
        settingsService.restart();
        return ctx.send({ message: 'Restarted', status: 200 });
      } catch (e) {
        throw throwError(ctx, e);
      }
    },
  };
};

export type SettingsController = ReturnType<typeof settingsController>;
export default settingsController;
