import { Nexus } from '../../@types/graphql';

export const getResolveCommentMultipleAbuseReportsInput = (nexus: Nexus) => {
  return nexus.inputObjectType({
    name: 'ResolveCommentMultipleAbuseReportsInput',
    definition(t) {
      t.nonNull.id('id');
      t.nonNull.string('relation');
      t.nonNull.list.nonNull.int('reportIds');
    },
  });
};
