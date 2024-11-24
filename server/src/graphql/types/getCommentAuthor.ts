import { Nexus } from '../../@types-v5/graphql';

export const getCommentAuthor = (nexus: Nexus) => {
  return nexus.objectType({
    name: 'CommentAuthor',
    definition(t) {
      t.id('id');
      t.nonNull.string('name');
      t.nonNull.string('email');
      t.string('avatar');
    },
  });
};
