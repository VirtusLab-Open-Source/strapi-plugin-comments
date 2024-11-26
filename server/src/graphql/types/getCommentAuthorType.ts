import { Nexus } from '../../@types-v5/graphql';
import { AUTHOR_TYPE } from '../../utils/constants';

export const getCommentAuthorType = (nexus: Nexus) => {
  return nexus.enumType({
    name: 'CommentAuthorType',
    description: 'User type which was the author of comment - Strapi built-in or generic',
    members: Object.values(AUTHOR_TYPE),
  });
};
