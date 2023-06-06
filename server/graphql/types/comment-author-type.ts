import { AUTHOR_TYPE } from '../../utils/constants';
import { StrapiGraphQLContext } from '../../../types';

export = ({ nexus }: StrapiGraphQLContext) =>
  nexus.enumType({
    name: 'AuthorType',
    description: "User type which was the author of comment - Strapi built-in or generic",
    members: Object.values(AUTHOR_TYPE),
  });
