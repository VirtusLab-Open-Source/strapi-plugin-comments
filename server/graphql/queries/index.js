'use strict'

module.exports = (context) => {
	const queries = {
		findAllFlat: require('./findAllFlat'),
		findAllInHierarchy: require('./findAllInHierarchy'),
	};

  return context.nexus.extendType({
    type: 'Query',
		definition(t) {
			for (const [name, configFactory] of Object.entries(queries)) {
				const config = configFactory(context);

				t.field(name, config);
			}
    },
  });
};
