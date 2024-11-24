import { isEmpty } from 'lodash';
import { CoreStrapi } from '../../@types-v5';
import { Nexus } from '../../@types-v5/graphql';
import { flatInput } from '../../controllers/utils/parsers';
import { getModelUid } from '../../repositories/utils';
import { AUTHOR_TYPE } from '../../utils/constants';
import { getPluginService } from '../../utils/getPluginService';

export default (strapi: CoreStrapi, nexus: Nexus) => {
  const { nonNull, intArg, arg } = nexus;
  const { service: getService } = strapi.plugin('graphql');
  const { args } = getService('internals');
  const { naming: { getFiltersInputTypeName } } = getService('utils');

  const contentType = strapi.contentType(getModelUid(strapi, 'comment'));

  return {
    type: 'ResponseFindAllPerAuthor',
    args: {
      authorId: nonNull(intArg()),
      authorType: arg({ type: 'AuthorType' }),
      filters: getFiltersInputTypeName(contentType),
      pagination: args.PaginationArg,
      sort: args.SortArg,
    },
    // @ts-ignore
    async resolve(obj: Object, args: ResponseFindAllPerAuthorResolverProps) {
      const { authorId, authorType, filters, sort, pagination } = args;
      const isStrapiUser = authorType !== AUTHOR_TYPE.GENERIC;
      return await getPluginService(strapi, 'common').findAllPerAuthor(
        flatInput({
          filters: getPluginService(strapi, 'gql').graphQLFiltersToStrapiQuery(filters, contentType),
          sort,
          pagination: pagination ? { ...pagination, withCount: !isEmpty(pagination) } : undefined,
          authorId,
        }),
        isStrapiUser,
      );
    },
  };

};
