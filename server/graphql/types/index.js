const typesFactories = [
	require('./id'),
	require('./comment'),
	require('./comment-nested'),
	require('./comment-author'),
	require('./create-comment'),
	require('./create-comment-author'),
	require('./update-comment'),
	require('./remove-comment'),
	require('./identify-comment-author'),
	require('./report'),
	require('./report-reason'),
	require('./create-report'),
	require('./response-pagination'),
	require('./response-meta'),
	require('./response-find-all'),
];

module.exports = context => typesFactories.map(factory => factory(context));