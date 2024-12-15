import { CoreStrapi, StrapiContext } from '../@types';
import { Nexus } from '../@types/graphql';
import { CommentsPluginConfig } from '../config';
import { CONFIG_PARAMS } from '../const';

import { getModelUid } from '../repositories/utils';
import { getPluginService } from '../utils/getPluginService';
import { getResolversConfig } from './getResolversConfig';
import { getMutations } from './mutations';
import { getQueries } from './queries';
import { getTypes } from './types';

export const setupGQL = async ({ strapi }: StrapiContext) => {
  if (strapi.plugin('graphql')) {
    const enableCollections = await getPluginService(strapi, 'common').getConfig(CONFIG_PARAMS.ENABLED_COLLECTIONS, []);
    if (enableCollections.length) {
      await handleConfig(strapi);
    }
  }
};

const handleConfig = async (strapi: CoreStrapi) => {
  const extensionService = strapi.plugin('graphql').service('extension');
  extensionService.shadowCRUD(getModelUid(strapi, 'comment')).disable();
  extensionService.shadowCRUD(getModelUid(strapi, 'comment')).disableQueries();
  extensionService.shadowCRUD(getModelUid(strapi, 'comment')).disableMutations();
  extensionService.shadowCRUD(getModelUid(strapi, 'comment-report')).disable();
  extensionService.shadowCRUD(getModelUid(strapi, 'comment-report')).disableQueries();
  extensionService.shadowCRUD(getModelUid(strapi, 'comment-report')).disableMutations();
  const config = await getPluginService(strapi, 'common').getConfig() as CommentsPluginConfig;

  extensionService.use(({ strapi, nexus }: { strapi: CoreStrapi, nexus: Nexus }) => {
    const types = getTypes(config, nexus);
    const queries = getQueries(strapi, nexus);
    const mutations = getMutations(strapi, nexus);
    const resolversConfig = getResolversConfig(config);
    return {
      types: [types, queries, mutations],
      resolversConfig,
    };
  });

};
