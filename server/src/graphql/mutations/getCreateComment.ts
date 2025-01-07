import { CoreStrapi } from '../../@types';
import { Nexus } from '../../@types/graphql';
import { getPluginService } from '../../utils/getPluginService';

export const getCreateComment = (strapi: CoreStrapi, nexus: Nexus) => {
  const { nonNull } = nexus;

  return {
    type: nonNull('CommentSingle'),
    args: {
      input: nonNull('CreateComment'),
    },
    async resolve(_: Object, args, ctx) {
      // TODO add zod validation
      const { input } = args;
      const { state: { user = undefined } = {} } = ctx;
      const { relation, ...body } = input;
      try {
        return await getPluginService(strapi, 'client').create(
          { ...body, relation },
          user,
        );
      } catch (e) {
        throw e;
      }
    },
  };
};
