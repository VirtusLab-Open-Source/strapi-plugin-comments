import { StrapiGraphQLContext } from "../../types";

export = ({ config }: StrapiGraphQLContext) => {
	const { gql: { auth = false } = {}} = config;
	return {
		'Query.findAllFlat': { auth },
		'Query.findAllInHierarchy': { auth },
		'Mutation.createComment': { auth },
		'Mutation.updateComment': { auth },
		'Mutation.removeComment': { auth },
		'Mutation.createAbuseReport': { auth },
	};
};
