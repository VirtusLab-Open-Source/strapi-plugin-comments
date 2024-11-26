import { Nexus } from "../../@types-v5/graphql";

export const getResponseMeta = (nexus: Nexus) => {
    return nexus.objectType({
        name: "ResponseMeta",
        definition(t) {
            t.field("pagination", { type: "ResponsePagination" });
        },
    });
};
