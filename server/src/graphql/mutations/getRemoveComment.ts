import { CoreStrapi } from '../../@types';
import { Nexus } from '../../@types/graphql';
import { getPluginService } from '../../utils/getPluginService';

export const getRemoveComment = (strapi: CoreStrapi, nexus: Nexus) => {
  const { nonNull } = nexus;

  return {
    type: nonNull('CommentSingle'),
    args: {
      input: nonNull('RemoveComment'),
    },
    async resolve(_: Object, args, ctx) {
      const { input } = args;
      const { state: { user = undefined } = {} } = ctx;
      const { id, relation, author } = input;
      try {
        return await getPluginService(strapi, 'client').markAsRemoved(
          { commentId: id, relation, authorId: author?.id },
          user,
        );
      } catch (e) {
        throw e;
      }
    },
  };
};
