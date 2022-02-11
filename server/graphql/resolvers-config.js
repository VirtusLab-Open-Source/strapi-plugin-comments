'use strict'

module.exports = ({ config }) => {
	const { gql: { auth = false } = {}} = config;
	console.log('auth', auth);
	return {
		'Query.findAllFlat': { auth },
		'Query.findAllInHierarchy': { auth },
		'Mutation.createComment': { auth },
		'Mutation.updateComment': { auth },
		'Mutation.removeComment': { auth },
		'Mutation.createAbuseReport': { auth },
	};
};
