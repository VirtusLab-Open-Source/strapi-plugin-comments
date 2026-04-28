import { Nexus } from '../../@types/graphql';

export const getResolveMultipleAbuseReportsInput = (nexus: Nexus) => {
  return nexus.inputObjectType({
    name: 'ResolveMultipleAbuseReportsInput',
    definition(t) {
      t.nonNull.string('relation');
      t.nonNull.list.nonNull.int('reportIds');
    },
  });
};
