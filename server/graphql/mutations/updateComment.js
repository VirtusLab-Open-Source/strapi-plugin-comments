'use strict'

const { getPluginService } = require('../../utils/functions');

module.exports = ({ nexus }) => {
	const { nonNull } = nexus;

	return {
		type: nonNull('CommentSingle'),
		args: {
			input: nonNull('UpdateComment'),
		},
		async resolve(obj, args, ctx) {
			const { input } = args;
			const { state: { user } = {} } = ctx;
			const { id, relation, ...body } = input;
			try {
				return await getPluginService('client')
					.update(id, relation, body, user);
			} catch(e) {
				throw new Error(e);
			}
		},
	};
}
