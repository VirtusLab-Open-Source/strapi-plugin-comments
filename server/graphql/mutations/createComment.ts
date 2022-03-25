'use strict'

import { IServiceClient, StrapiGraphQLContext, StrapiRequestContext, ToBeFixed } from "../../../types";

import { getPluginService } from '../../utils/functions';

type CreateCommentProps = {
	input: ToBeFixed
}

export = ({ nexus }: StrapiGraphQLContext) => {
	const { nonNull } = nexus;

	return {
		type: nonNull('CommentSingle'),
		args: {
			input: nonNull('CreateComment'),
		},
		// @ts-ignore
		async resolve(obj: Object, args: CreateCommentProps, ctx: StrapiRequestContext & ToBeFixed) {
			const { input } = args;
			const { state: { user = undefined } = {} } = ctx;
			const { relation, ...body } = input;
			try {
				return await getPluginService<IServiceClient>('client')
					.create(relation, body, user);
			} catch(e: ToBeFixed) {
				throw new Error(e);
			}
		},
	};
}
