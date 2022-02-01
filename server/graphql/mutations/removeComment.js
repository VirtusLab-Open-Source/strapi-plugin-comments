'use strict'

const { getPluginService } = require('../../utils/functions');

module.exports = ({ nexus }) => {
	const { nonNull } = nexus;

	return {
		type: nonNull('CommentSingle'),
		args: {
			input: nonNull('RemoveComment'),
		},
		async resolve(obj, args, ctx) {
			const { input } = args;
			const { state: { user } = {} } = ctx;
			const { id, relation, author } = input;
			try {
				return await getPluginService('client')
					.markAsRemoved(id, relation, author?.id, user);
			} catch(e) {
				throw new Error(e);
			}
		},
	};
}
