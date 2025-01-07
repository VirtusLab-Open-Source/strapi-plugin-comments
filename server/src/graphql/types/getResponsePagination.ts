import { Nexus } from '../../@types/graphql';

export const getResponsePagination = (nexus: Nexus) => {
    return nexus.objectType({
        name: "ResponsePagination",
        definition(t) {
            t.int("page");
            t.int("pageSize");
            t.int("pageCount");
            t.int("total");
            t.int("start");
            t.int("limit");
        },
    });
};
