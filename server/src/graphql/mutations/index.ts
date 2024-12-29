import { CoreStrapi } from '../../@types';
import { Nexus } from '../../@types/graphql';
import { getCreateAbuseReport } from './getCreateAbuseReport';
import { getCreateComment } from './getCreateComment';
import { getRemoveComment } from './getRemoveComment';
import { getUpdateComment } from './getUpdateComment';


export const getMutations = (strapi: CoreStrapi, nexus: Nexus) => {
  const mutations = {
    getCreateComment,
    getUpdateComment,
    getRemoveComment,
    getCreateAbuseReport,
  };

  return nexus.extendType({
    type: 'Mutation',
    definition(t) {
      for (const [name, configFactory] of Object.entries(mutations)) {
        const config = configFactory(strapi, nexus);

        t.field(name, config);
      }
    },
  });
};
