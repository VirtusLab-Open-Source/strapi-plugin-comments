import { Nexus } from '../../@types/graphql';

export const getUpdateComment = (nexus: Nexus) => {
    return nexus.inputObjectType({
        name: "UpdateComment",
        definition(t) {
            t.id("id");
            t.nonNull.string("content");
            t.nonNull.string("relation");
            t.field("author", { type: "IdentifyCommentAuthor" });
        },
    });
};
