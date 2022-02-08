'use strict'

const contentType = require('../../../content-types/comment');
const { flatInput } = require('../../controllers/utils/parsers');
const { getPluginService } = require('../../utils/functions');

module.exports = ({ strapi, nexus }) => {
	const { nonNull, list, stringArg } = nexus;
	const { service: getService } = strapi.plugin('graphql');
	const { args } = getService('internals');

	return {
		type: nonNull(list('CommentSingle')),
		args: {
			relation: nonNull(stringArg()),
			filters: getPluginService('gql').buildContentTypeFilters(contentType),
			pagination: args.PaginationArg,
			sort: args.SortArg,
		},
		async resolve(obj, args) {
			const { relation, filters, sort, pagination } = args;
			return await getPluginService('common')
				.findAllFlat(flatInput(
					relation, 
					getPluginService('gql').graphQLFiltersToStrapiQuery(filters, contentType),
					sort,
					pagination
				), undefined);
		},
	};
}
