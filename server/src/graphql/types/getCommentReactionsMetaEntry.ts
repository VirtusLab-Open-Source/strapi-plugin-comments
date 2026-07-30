import { Nexus } from '../../@types/graphql';

export const getCommentReactionsMetaEntry = (nexus: Nexus) => {
  return nexus.objectType({
    name: 'CommentReactionsMetaEntry',
    definition(t) {
      t.nonNull.string('documentId');
      t.nonNull.list.field('counts', { type: 'CommentReactionCount' });
    },
  });
};
