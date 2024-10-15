import { StrapiContext } from '../@types-v5';
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
      return result.left;
    },
  });
};