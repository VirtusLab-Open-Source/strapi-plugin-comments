'use strict'

const getTypes = require('./types');
const getQueries = require('./queries');
const getMutations = require('./mutations');
const getResolversConfig = require('./resolvers-config');
const { getModelUid } = require('../services/utils/functions');

module.exports = async ({ strapi, config}) => {
	const extensionService = strapi.plugin('graphql').service('extension');
	extensionService.shadowCRUD(getModelUid('comment')).disable();
	extensionService.shadowCRUD(getModelUid('comment-report')).disable();
	console.log(extensionService);
	extensionService.use(({ strapi, nexus }) => {
		const types = getTypes({ strapi, nexus, config });
		console.log('types', types);
		const queries = getQueries({ strapi, nexus, config });
		const mutations = getMutations({ strapi, nexus, config });
		const resolversConfig = getResolversConfig({ strapi, config });

		return {
			types: [types, queries, mutations],
			resolversConfig,
		}
	});
}
