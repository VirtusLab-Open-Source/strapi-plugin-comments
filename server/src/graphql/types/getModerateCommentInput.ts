import { Nexus } from '../../@types/graphql';

export const getModerateCommentInput = (nexus: Nexus) => {
  return nexus.inputObjectType({
    name: 'ModerateCommentInput',
    definition(t) {
      t.nonNull.id('id');
      t.nonNull.string('relation');
    },
  });
};
