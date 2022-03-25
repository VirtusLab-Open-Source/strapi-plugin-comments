import { INexusType, StrapiGraphQLContext } from "../../../types";

export = ({ nexus }: StrapiGraphQLContext) =>
  nexus.objectType({
    name: "CommentAuthor",
    definition(t: INexusType) {
      t.id("id");
      t.nonNull.string("name");
      t.string("email");
      t.string("avatar");
    },
  });
