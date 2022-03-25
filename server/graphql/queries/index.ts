import { INexusType, StrapiGraphQLContext } from "../../../types";

import findAllFlat from './findAllFlat';
import findAllInHierarchy from './findAllInHierarchy';


export = (context: StrapiGraphQLContext) => {
	const queries = {
		findAllFlat,
		findAllInHierarchy,
	};

  return context.nexus.extendType({
    type: 'Query',
		definition(t: INexusType) {
			for (const [name, configFactory] of Object.entries(queries)) {
				const config = configFactory(context);

				t.field(name, config);
			}
    },
  });
};
