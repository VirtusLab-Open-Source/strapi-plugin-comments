import { INexusType, StrapiGraphQLContext } from "../../../types";

export = ({ nexus }: StrapiGraphQLContext) =>
  nexus.objectType({
    name: "ResponseFindAll",
    definition(t: INexusType) {
      t.list.field("data", { type: "CommentSingle" });
      t.field("meta", { type: "ResponseMeta" });
    },
  });
