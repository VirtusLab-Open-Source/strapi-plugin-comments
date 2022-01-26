'use strict'

const getTypes = require('./types');
const getQueries = require('./queries');
const getMutations = require('./mutations');
const getResolversConfig = require('./resolvers-config');
const { getModelUid } = require('../services/utils/functions');

module.exports = () => {
	const extensionService = strapi.plugin('graphql').service('extension');

	extensionService.shadowCRUD(getModelUid('comment')).disable();
	extensionService.shadowCRUD(getModelUid('comment-report')).disable();

	extensionService.use(({ nexus }) => {
		const types = getTypes({ strapi, nexus });
		const queries = getQueries({ strapi, nexus });
		const mutations = getMutations({ strapi, nexus });
		const resolversConfig = getResolversConfig({ strapi });

		return {
			types: [types, queries, mutations],
			resolversConfig,
		}
	});
}
