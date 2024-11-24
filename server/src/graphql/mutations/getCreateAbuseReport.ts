import { CoreStrapi } from '../../@types-v5';
import { Nexus } from '../../@types-v5/graphql';
import { getPluginService } from '../../utils/getPluginService';

export const getCreateAbuseReport = (strapi: CoreStrapi, nexus: Nexus) => {
  const { nonNull } = nexus;

  return {
    type: nonNull('Report'),
    args: {
      input: nonNull('CreateReport'),
    },
    async resolve(_: Object, args, ctx) {
      const { input } = args;
      const { state: { user = undefined } = {} } = ctx;
      const { commentId, relation, ...body } = input;
      try {
        return await getPluginService(strapi, 'client').reportAbuse(
          { ...body, commentId, relation },
          user,
        );
      } catch (e) {
        throw e;
      }
    },
  };
};
