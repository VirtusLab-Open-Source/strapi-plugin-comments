import { INexusType, StrapiGraphQLContext } from "../../@types";

export = ({ nexus }: StrapiGraphQLContext) =>
  nexus.inputObjectType({
    name: "UpdateComment",
    definition(t: INexusType) {
      t.id("id");
      t.nonNull.string("content");
      t.nonNull.string("relation");
      t.field("author", { type: "IdentifyCommentAuthor" });
    },
  });
