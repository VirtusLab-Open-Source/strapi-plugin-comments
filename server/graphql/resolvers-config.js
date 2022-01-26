'use strict'

module.exports = ({ }) => ({
	'Query.findAllFlat': { auth: false },
	'Query.findAllInHierarchy': { auth: false },
	'Mutation.createComment': { auth: false },
	'Mutation.updateComment': { auth: false },
	'Mutation.removeComment': { auth: false },
	'Mutation.createAbuseReport': { auth: false },
});
