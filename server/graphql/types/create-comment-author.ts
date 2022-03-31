import { INexusType, StrapiGraphQLContext } from "../../../types";

export = ({ nexus }: StrapiGraphQLContext) =>
  nexus.inputObjectType({
    name: "CreateCommentAuthor",
    definition(t: INexusType) {
      t.nonNull.id("id");
      t.nonNull.string("name");
      t.string("email");
      t.string("avatar");
    },
  });
