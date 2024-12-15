import { Nexus } from '../../@types/graphql';
import { CommentsPluginConfig } from '../../config';

export const getReportReason = (nexus: Nexus, { reportReasons }: CommentsPluginConfig) => {
    return nexus.enumType({
        name: 'ReportReason',
        description: 'Reason of abuse report',
        members: Object.values(reportReasons),
  });
};
