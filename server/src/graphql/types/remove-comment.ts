import { INexusType, StrapiGraphQLContext } from "../../@types";

export = ({ nexus }: StrapiGraphQLContext) =>
  nexus.inputObjectType({
    name: "RemoveComment",
    definition(t: INexusType) {
      t.id("id");
      t.nonNull.string("relation");
      t.field("author", { type: "IdentifyCommentAuthor" });
    },
  });
