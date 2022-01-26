'use strict'

const contentType = require('../../../content-types/comment');
const { flatInput } = require('../../controllers/utils/parsers');
const { getPluginService } = require('../../utils/functions');

module.exports = ({ strapi, nexus }) => {
	const { nonNull, list, stringArg } = nexus;
	const { service: getService } = strapi.plugin('graphql');
	const { args } = getService('internals');

	return {
		type: nonNull(list('CommentNested')),
		args: {
			relation: nonNull(stringArg()),
			// filters: filtersArg,
			sort: args.SortArg,
		},
		async resolve(obj, args) {
			const { relation, filters } = args;
			return await getPluginService('common')
				.findAllInHierarchy({
					...flatInput(
						relation, 
						getPluginService('gql').graphQLFiltersToStrapiQuery(filters, contentType)
					),
					dropBlockedThreads: true,
				});
		},
	};
}
