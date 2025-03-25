import { CommentsPluginConfig } from '../config';

export const getResolversConfig = (config: CommentsPluginConfig) => {
  const { gql: { auth = false } = {} } = config;
  return {
    'Query.findAllFlat': { auth },
    'Query.findAllInHierarchy': { auth },
    'Mutation.getCreateComment': { auth },
    'Mutation.getUpdateComment': { auth },
    'Mutation.getRemoveComment': { auth },
    'Mutation.getCreateAbuseReport': { auth },
  };
};
