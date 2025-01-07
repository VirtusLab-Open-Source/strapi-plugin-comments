import { CoreStrapi } from '../../@types';
import { Nexus } from '../../@types/graphql';
import { getPluginService } from '../../utils/getPluginService';

export const getUpdateComment = (strapi: CoreStrapi, nexus: Nexus) => {
  const { nonNull } = nexus;

  return {
    type: nonNull('CommentSingle'),
    args: {
      input: nonNull('UpdateComment'),
    },
    async resolve(_: Object, args, ctx) {
      const { input } = args;
      const { state: { user = undefined } = {} } = ctx;
      const { id, relation, ...body } = input;
      try {
        return await getPluginService(strapi, 'client').update(
          { ...body, relation, commentId: id },
          user,
        );
      } catch (e) {
        throw e;
      }
    },
  };
};
