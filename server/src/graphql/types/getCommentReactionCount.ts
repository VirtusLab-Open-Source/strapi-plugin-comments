import { Nexus } from '../../@types/graphql';

export const getCommentReactionCount = (nexus: Nexus) => {
  return nexus.objectType({
    name: 'CommentReactionCount',
    definition(t) {
      t.nonNull.string('slug');
      t.nonNull.int('count');
    },
  });
};
