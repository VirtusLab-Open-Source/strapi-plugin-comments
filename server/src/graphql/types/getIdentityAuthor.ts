import { Nexus } from "../../@types-v5/graphql";

export const getIdentityAuthor = (nexus: Nexus) => {
    return nexus.inputObjectType({
        name: "IdentifyCommentAuthor",
        definition(t) {
            t.nonNull.id("id");
        },
    });
};
