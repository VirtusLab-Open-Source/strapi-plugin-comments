import { Nexus } from "../../@types-v5/graphql";

export const getIdentityAuthor = (nexus: Nexus) => {
    return nexus.inputObjectType({
        name: "IdentityAuthor",
        definition(t) {
            t.nonNull.id("id");
        },
    });
};
