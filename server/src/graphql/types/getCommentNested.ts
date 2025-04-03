import { Nexus } from '../../@types/graphql';

export const getCommentNested = (nexus: Nexus) => {
  return nexus.objectType({
    name: 'CommentNested',
    definition(t) {
      t.id('id');
      t.string('documentId');
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
      t.float('rating');
    },
  });
};
