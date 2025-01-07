import { StrapiContext } from '../@types';
import { CommentsPluginConfig } from '../config';
import { getStoreRepository } from '../repositories';
import { isRight } from '../utils/Either';

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
