import { StrapiGraphQLContext } from "../../types";

import getTypes from "./types";
import getQueries from "./queries";
import getMutations from "./mutations";
import getResolversConfig from "./resolvers-config";
import { getModelUid } from "../services/utils/functions";

export = async ({ strapi, config }: StrapiGraphQLContext) => {
  const extensionService = strapi.plugin("graphql").service("extension");
  extensionService.shadowCRUD(getModelUid("comment")).disableQueries();
  extensionService.shadowCRUD(getModelUid("comment")).disableMutations();
  extensionService.shadowCRUD(getModelUid("comment-report")).disableQueries();
  extensionService.shadowCRUD(getModelUid("comment-report")).disableMutations();

  extensionService.use(({ strapi, nexus }: StrapiGraphQLContext) => {
    const types = getTypes({ strapi, nexus, config });
    const queries = getQueries({ strapi, nexus, config });
    const mutations = getMutations({ strapi, nexus, config });
    const resolversConfig = getResolversConfig({ strapi, config });

    return {
      types: [types, queries, mutations],
      resolversConfig,
    };
  });
};
