import { StrapiRequestContext } from "strapi-typed";
import {
  IServiceClient,
  NexusRequestProps,
  StrapiGraphQLContext,
  ToBeFixed,
} from "../../@types";
import { getPluginService } from "../../utils/functions";

export = ({ nexus }: StrapiGraphQLContext) => {
  const { nonNull } = nexus;

  return {
    type: nonNull("Report"),
    args: {
      input: nonNull("CreateReport"),
    },
    async resolve(
      _: Object,
      args: NexusRequestProps,
      ctx: StrapiRequestContext<never> & ToBeFixed
    ) {
      const { input } = args;
      const { state: { user = undefined } = {} } = ctx;
      const { commentId, relation, ...body } = input;
      try {
        return await getPluginService<IServiceClient>("client").reportAbuse(
          commentId,
          relation,
          body,
          user
        );
      } catch (e: ToBeFixed) {
        throw new Error(e);
      }
    },
  };
};
