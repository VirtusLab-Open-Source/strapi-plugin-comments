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
    'Mutation.blockComment': { auth },
    'Mutation.unblockComment': { auth },
    'Mutation.blockCommentThread': { auth },
    'Mutation.unblockCommentThread': { auth },
    'Mutation.approveComment': { auth },
    'Mutation.rejectComment': { auth },
    'Mutation.resolveAbuseReport': { auth },
    'Mutation.resolveCommentMultipleAbuseReports': { auth },
    'Mutation.resolveAllAbuseReportsForComment': { auth },
    'Mutation.resolveAllAbuseReportsForThread': { auth },
    'Mutation.resolveMultipleAbuseReports': { auth },
  };
};
