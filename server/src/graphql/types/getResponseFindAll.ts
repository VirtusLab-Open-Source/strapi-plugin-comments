import { Nexus } from "../../@types-v5/graphql";

export const getResponseFindAll = (nexus: Nexus) => {
    return nexus.objectType({
        name: "ResponseFindAll",
        definition(t) {
            t.nonNull.list.field("data", { type: "CommentSingle" });
            t.field("meta", { type: "ResponseMeta" });
        },
    });
};
