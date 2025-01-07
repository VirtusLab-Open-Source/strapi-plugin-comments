import { Nexus } from '../../@types/graphql';

export const getResponseFindAllPerAuthor = (nexus: Nexus) => {
    return nexus.objectType({
        name: "ResponseFindAllPerAuthor",
        definition(t) {
            t.nonNull.list.field("data", { type: "CommentSingle" });
            t.field("meta", { type: "ResponseMeta" });
        },
    });
};
