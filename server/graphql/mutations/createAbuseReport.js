'use strict'

const { getPluginService } = require('../../utils/functions');

module.exports = ({ nexus }) => {
	const { nonNull } = nexus;

	return {
		type: nonNull('Report'),
		args: {
			input: nonNull('CreateReport'),
		},
		async resolve(obj, args) {
			const { input } = args;
			const { commentId, relation, ...body } = input;
			return await getPluginService('client')
				.reportAbuse(commentId, relation, body);
		},
	};
}
