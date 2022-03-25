'use strict'

import { IServiceClient, NexusRequestProps, StrapiGraphQLContext, StrapiRequestContext, ToBeFixed } from "../../../types";

import { getPluginService } from '../../utils/functions';

export = ({ nexus }: StrapiGraphQLContext) => {
	const { nonNull } = nexus;

	return {
		type: nonNull('CommentSingle'),
		args: {
			input: nonNull('RemoveComment'),
		},
		// @ts-ignore
		async resolve(obj: Object, args: NexusRequestProps, ctx: StrapiRequestContext & ToBeFixed) {
			const { input } = args;
			const { state: { user = undefined } = {} } = ctx;
			const { id, relation, author } = input;
			try {
				return await getPluginService<IServiceClient>('client')
					.markAsRemoved(id, relation, author?.id, user);
			} catch(e: ToBeFixed) {
				throw new Error(e);
			}
		},
	};
}
