'use strict'

const { getPluginService } = require('../../utils/functions');

module.exports = ({ nexus }) => {
	const { nonNull } = nexus;

	return {
		type: nonNull('CommentSingle'),
		args: {
			input: nonNull('UpdateComment'),
		},
		async resolve(obj, args) {
			const { input } = args;
			const { id, relation, ...body } = input;
			return await getPluginService('client')
				.update(id, relation, body);
		},
	};
}
