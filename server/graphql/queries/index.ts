import { INexusType, StrapiGraphQLContext } from "../../../types";

import findAllFlat from "./findAllFlat";
import findAllInHierarchy from "./findAllInHierarchy";
import findAllPerAuthor from "./findAllPerAuthor";

export = (context: StrapiGraphQLContext) => {
  const queries = {
    findAllFlat,
    findAllInHierarchy,
    findAllPerAuthor,
  };

  return context.nexus.extendType({
    type: "Query",
    definition(t: INexusType) {
      for (const [name, configFactory] of Object.entries(queries)) {
        const config = configFactory(context);

        t.field(name, config);
      }
    },
  });
};
