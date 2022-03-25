import { INexusType, StrapiGraphQLContext } from "../../../types";

import createComment from './createComment';
import updateComment from './updateComment';
import removeComment from './removeComment';
import createAbuseReport from './createAbuseReport';

export = (context: StrapiGraphQLContext) => {
	const mutations = {
		createComment,
		updateComment,
		removeComment,
		createAbuseReport,
	};

  return context.nexus.extendType({
    type: 'Mutation',
		definition(t: INexusType) {
			for (const [name, configFactory] of Object.entries(mutations)) {
				const config = configFactory(context);

				t.field(name, config);
			}
    },
  });
};
