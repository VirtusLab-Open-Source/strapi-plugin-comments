import { Nexus } from "../../@types-v5/graphql";

export const getCommentNested = (nexus: Nexus) => {
  return nexus.objectType({
    name: 'CommentNested',
    definition(t) {
      t.id('id');
      t.nonNull.string('content');
      t.boolean('blocked');
      t.boolean('blockedThread');
      t.string('approvalStatus');
      t.boolean('removed');
      t.field('threadOf', { type: 'CommentSingle' });
      t.list.field('children', { type: 'CommentNested' });
      t.field('author', { type: 'CommentAuthor' });
      t.string('createdAt');
      t.string('updatedAt');
    },
  });
};
