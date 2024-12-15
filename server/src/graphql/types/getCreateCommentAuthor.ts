import { Nexus } from '../../@types/graphql';

export const getCreateCommentAuthor = (nexus: Nexus) => {
    return nexus.inputObjectType({
        name: "CreateCommentAuthor",
        definition(t) {
          t.nonNull.id("id");
          t.nonNull.string("name");
          t.string("email");
          t.string("avatar");
        },
    });
};
