import { Nexus } from "../../@types-v5/graphql";

export const getRemoveComment = (nexus: Nexus) => {
    return nexus.inputObjectType({
        name: "RemoveComment",
        definition(t) {
            t.id("id");
            t.nonNull.string("relation");
            t.field("author", { type: "IdentifyCommentAuthor" });
        },
    });
};
