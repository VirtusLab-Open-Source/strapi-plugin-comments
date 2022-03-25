
import { IServiceClient, NexusRequestProps, StrapiGraphQLContext, StrapiRequestContext, ToBeFixed } from '../../../types';
import { getPluginService } from '../../utils/functions';

export = ({ nexus }: StrapiGraphQLContext) => {
	const { nonNull } = nexus;

	return {
		type: nonNull('Report'),
		args: {
			input: nonNull('CreateReport'),
		},
		// @ts-ignore
		async resolve(obj: Object, args: NexusRequestProps, ctx: StrapiRequestContext & ToBeFixed) {
			const { input } = args;
			const { state: { user = undefined } = {} } = ctx;
			const { commentId, relation, ...body } = input;
			try {
				return await getPluginService<IServiceClient>('client')
					.reportAbuse(commentId, relation, body, user);
			} catch(e: ToBeFixed) {
				throw new Error(e);
			}
		},
	};
}
