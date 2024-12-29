import { Nexus } from '../../@types/graphql';

export const getCreateReport = (nexus: Nexus) => {
    return nexus.inputObjectType({
        name: "CreateReport",
        definition(t) {
            t.id("commentId");
            t.nonNull.string("relation");
            t.nonNull.string("content");
            t.field("reason", { type: "ReportReason" });
        },
    });
};
