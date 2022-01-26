'use strict'

module.exports = (context) => {
	const mutations = {
		createComment: require('./createComment'),
		updateComment: require('./updateComment'),
		removeComment: require('./removeComment'),
		createAbuseReport: require('./createAbuseReport'),
	};

  return context.nexus.extendType({
    type: 'Mutation',
		definition(t) {
			for (const [name, configFactory] of Object.entries(mutations)) {
				const config = configFactory(context);

				t.field(name, config);
			}
    },
  });
};
