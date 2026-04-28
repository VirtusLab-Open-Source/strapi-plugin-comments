import { Nexus } from '../../@types/graphql';

export const getResolveAbuseReportInput = (nexus: Nexus) => {
  return nexus.inputObjectType({
    name: 'ResolveAbuseReportInput',
    definition(t) {
      t.nonNull.id('id');
      t.nonNull.string('relation');
      t.nonNull.int('reportId');
    },
  });
};
