"use strict";

import { StrapiRequestContext } from "strapi-typed";
import {
  IServiceClient,
  NexusRequestProps,
  StrapiGraphQLContext,
  ToBeFixed,
} from "../../../types";

import { getPluginService } from "../../utils/functions";

export = ({ nexus }: StrapiGraphQLContext) => {
  const { nonNull } = nexus;

  return {
    type: nonNull("CommentSingle"),
    args: {
      input: nonNull("RemoveComment"),
    },
    async resolve(
      _: Object,
      args: NexusRequestProps,
      ctx: StrapiRequestContext<never> & ToBeFixed
    ) {
      const { input } = args;
      const { state: { user = undefined } = {} } = ctx;
      const { id, relation, author } = input;
      try {
        return await getPluginService<IServiceClient>("client").markAsRemoved(
          id,
          relation,
          author?.id,
          user
        );
      } catch (e: ToBeFixed) {
        throw new Error(e);
      }
    },
  };
};
