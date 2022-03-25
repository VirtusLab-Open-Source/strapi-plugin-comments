'use strict'

import { IServiceClient, NexusRequestProps, StrapiGraphQLContext, StrapiRequestContext, ToBeFixed } from '../../../types';
import { getPluginService } from '../../utils/functions';

export = ({ nexus }: StrapiGraphQLContext) => {
	const { nonNull } = nexus;

	return {
		type: nonNull('CommentSingle'),
		args: {
			input: nonNull('UpdateComment'),
		},
		// @ts-ignore
		async resolve(obj: Object, args: NexusRequestProps, ctx: StrapiRequestContext & ToBeFixed) {
			const { input } = args;
			const { state: { user = undefined } = {} } = ctx;
			const { id, relation, ...body } = input;
			try {
				return await getPluginService<IServiceClient>('client')
					.update(id, relation, body, user);
			} catch(e: ToBeFixed) {
				throw new Error(e);
			}
		},
	};
}
