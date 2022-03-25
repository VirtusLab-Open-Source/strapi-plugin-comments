import { INexusType, StrapiGraphQLContext } from "../../../types";

export = ({ nexus }: StrapiGraphQLContext) =>
  nexus.objectType({
    name: "ResponsePagination",
    definition(t: INexusType) {
      t.int("page");
      t.int("pageSize");
      t.int("pageCount");
      t.int("total");
      t.int("start");
      t.int("limit");
    },
  });
