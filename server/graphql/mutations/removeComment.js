'use strict'

const { getPluginService } = require('../../utils/functions');

module.exports = ({ nexus }) => {
	const { nonNull } = nexus;

	return {
		type: nonNull('CommentSingle'),
		args: {
			input: nonNull('RemoveComment'),
		},
		async resolve(obj, args) {
			const { input } = args;
			const { id, relation, author } = input;
			return await getPluginService('client')
				.markAsRemoved(id, relation, author?.id);
		},
	};
}
