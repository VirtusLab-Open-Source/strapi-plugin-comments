'use strict'

const { getPluginService } = require("../utils/functions");

module.exports = () => {
	const auth = getPluginService('common').getConfig('gql.auth', false);
	return {
		'Query.findAllFlat': { auth },
		'Query.findAllInHierarchy': { auth },
		'Mutation.createComment': { auth },
		'Mutation.updateComment': { auth },
		'Mutation.removeComment': { auth },
		'Mutation.createAbuseReport': { auth },
	};
};
