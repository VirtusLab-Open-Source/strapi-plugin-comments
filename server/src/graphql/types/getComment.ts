import { Nexus } from '../../@types/graphql';

export const getComment = (nexus: Nexus) => {
  return nexus.objectType({
    name: 'CommentSingle',
    definition(t) {
        t.id("id");
        t.string("documentId");
        t.nonNull.string("content");
        t.boolean("blocked");
        t.boolean("blockedThread");
        t.boolean("removed");
        t.string("approvalStatus");
        t.field("threadOf", { type: "CommentSingle" });
        t.field("author", { type: "CommentAuthor" });
        t.string("createdAt");
        t.string("updatedAt");
        t.list.field("reactions", {
          type: "CommentReactionCount",
          resolve(parent: { reactions?: Record<string, number> }) {
            return Object.entries(parent.reactions || {}).map(([slug, count]) => ({
              slug,
              count,
            }));
          },
        });
    },
  });
};
