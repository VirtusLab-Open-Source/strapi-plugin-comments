import { Nexus } from '../../@types/graphql';

const mapReactionsMetaToEntries = (reactions: Record<string, Record<string, number>> = {}) =>
  Object.entries(reactions).map(([documentId, counts]) => ({
    documentId,
    counts: Object.entries(counts).map(([slug, count]) => ({ slug, count })),
  }));

export const getResponseMeta = (nexus: Nexus) => {
    return nexus.objectType({
        name: "ResponseMeta",
        definition(t) {
            t.field("pagination", { type: "ResponsePagination" });
            t.list.field("reactions", {
              type: "CommentReactionsMetaEntry",
              resolve(parent: { reactions?: Record<string, Record<string, number>> }) {
                return mapReactionsMetaToEntries(parent.reactions);
              },
            });
        },
    });
};
