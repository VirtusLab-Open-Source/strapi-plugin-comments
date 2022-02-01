'use strict'

const { getPluginService } = require('../../utils/functions');

module.exports = ({ nexus }) => {
	const { nonNull } = nexus;

	return {
		type: nonNull('Report'),
		args: {
			input: nonNull('CreateReport'),
		},
		async resolve(obj, args, ctx) {
			const { input } = args;
			const { state: { user } = {} } = ctx;
			const { commentId, relation, ...body } = input;
			try {
				return await getPluginService('client')
					.reportAbuse(commentId, relation, body, user);
			} catch(e) {
				throw new Error(e);
			}
		},
	};
}
