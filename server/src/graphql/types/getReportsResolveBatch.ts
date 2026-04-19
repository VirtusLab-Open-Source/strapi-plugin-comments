import { Nexus } from '../../@types/graphql';

export const getReportsResolveBatch = (nexus: Nexus) => {
  return nexus.objectType({
    name: 'ReportsResolveBatch',
    definition(t) {
      t.nonNull.int('count');
    },
  });
};
