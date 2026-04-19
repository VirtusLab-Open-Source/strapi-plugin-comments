import { CoreStrapi } from '../../@types';
import { Nexus } from '../../@types/graphql';
import { getCreateAbuseReport } from './getCreateAbuseReport';
import { getCreateComment } from './getCreateComment';
import { getApproveComment } from './getApproveComment';
import { getBlockComment } from './getBlockComment';
import { getBlockCommentThread } from './getBlockCommentThread';
import { getRejectComment } from './getRejectComment';
import { getRemoveComment } from './getRemoveComment';
import { getResolveAbuseReport } from './getResolveAbuseReport';
import { getResolveAllAbuseReportsForComment } from './getResolveAllAbuseReportsForComment';
import { getResolveAllAbuseReportsForThread } from './getResolveAllAbuseReportsForThread';
import { getResolveCommentMultipleAbuseReports } from './getResolveCommentMultipleAbuseReports';
import { getResolveMultipleAbuseReports } from './getResolveMultipleAbuseReports';
import { getUnblockComment } from './getUnblockComment';
import { getUnblockCommentThread } from './getUnblockCommentThread';
import { getUpdateComment } from './getUpdateComment';


export const getMutations = (strapi: CoreStrapi, nexus: Nexus) => {
  const mutations = {
    getCreateComment,
    getUpdateComment,
    getRemoveComment,
    getCreateAbuseReport,
    blockComment: getBlockComment,
    unblockComment: getUnblockComment,
    blockCommentThread: getBlockCommentThread,
    unblockCommentThread: getUnblockCommentThread,
    approveComment: getApproveComment,
    rejectComment: getRejectComment,
    resolveAbuseReport: getResolveAbuseReport,
    resolveCommentMultipleAbuseReports: getResolveCommentMultipleAbuseReports,
    resolveAllAbuseReportsForComment: getResolveAllAbuseReportsForComment,
    resolveAllAbuseReportsForThread: getResolveAllAbuseReportsForThread,
    resolveMultipleAbuseReports: getResolveMultipleAbuseReports,
  };

  return nexus.extendType({
    type: 'Mutation',
    definition(t) {
      for (const [name, configFactory] of Object.entries(mutations)) {
        const config = configFactory(strapi, nexus);

        t.field(name, config);
      }
    },
  });
};
