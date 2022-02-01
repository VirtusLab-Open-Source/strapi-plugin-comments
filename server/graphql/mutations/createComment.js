'use strict'

const { getPluginService } = require('../../utils/functions');

module.exports = ({ nexus }) => {
	const { nonNull } = nexus;

	return {
		type: nonNull('CommentSingle'),
		args: {
			input: nonNull('CreateComment'),
		},
		async resolve(obj, args, ctx) {
			const { input } = args;
			const { state: { user } = {} } = ctx;
			const { relation, ...body } = input;
			try {
				return await getPluginService('client')
					.create(relation, body, user);
			} catch(e) {
				throw new Error(e);
			}
		},
	};
}
