import { Nexus } from '../../@types/graphql';

export const getCreateComment = (nexus: Nexus) => {
    return nexus.inputObjectType({
        name: "CreateComment",
        definition(t) {
            t.nonNull.string("content");
            t.nonNull.string("relation");
            t.id("threadOf");
            t.field("author", { type: "CreateCommentAuthor" });
            t.float('rating');
            t.string('lastExperience');
        },
    });
};
