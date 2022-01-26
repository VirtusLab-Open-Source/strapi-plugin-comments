'use strict'

const { getPluginService } = require('../../utils/functions');

module.exports = ({ nexus }) => {
	const { nonNull } = nexus;

	return {
		type: nonNull('CommentSingle'),
		args: {
			input: nonNull('CreateComment'),
		},
		async resolve(obj, args) {
			const { input } = args;
			const { relation, ...body } = input;
			return await getPluginService('client')
				.create(relation, body);
		},
	};
}
