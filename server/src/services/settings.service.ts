import { StrapiContext } from '../@types-v5';
import { getStoreRepository } from '../repositories';
import { isRight } from '../utils/Either';
import { CommentsPluginConfig } from '../validators/api/controllers/settings.controller.validator';

export default ({ strapi }: StrapiContext) => {
  const storeRepository = getStoreRepository(strapi);
  return ({
    getConfig: async (viaSettingsPage = false) => {
      const result = await storeRepository.get(viaSettingsPage);
      if (isRight(result)) {
        return result.right;
      }
      throw result.left;
    },
    update: async (config: CommentsPluginConfig) => {
      const result = await storeRepository.update(config);
      if (isRight(result)) {
        return result.right;
      }
      throw result.left;
    },
    restore: async () => {
      const result = await storeRepository.restore();
      if (isRight(result)) {
        return result.right;
      }
      throw result.left;
    },
    restart: () => {
      return strapi.reload();
    },
  });
};