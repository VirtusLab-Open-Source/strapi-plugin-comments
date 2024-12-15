import { CoreStrapi } from '../../@types';
import { Nexus } from '../../@types/graphql';
import { flatInput } from '../../controllers/utils/parsers';
import { getModelUid } from '../../repositories/utils';
import { getPluginService } from '../../utils/getPluginService';

export default (strapi: CoreStrapi, nexus: Nexus) => {
  const { nonNull, list, stringArg } = nexus;
  const { service: getService } = strapi.plugin('graphql');
  const { args } = getService('internals');
  const { naming: { getFiltersInputTypeName } } = getService('utils');

  const contentType = strapi.contentType(getModelUid(strapi, 'comment'));

  return {
    type: nonNull(list('CommentNested')),
    args: {
      relation: nonNull(stringArg()),
      sort: args.SortArg,
      filters: getFiltersInputTypeName(contentType),
    },
    async resolve(_obj, args) {
      const { relation, filters, sort } = args;
      return await getPluginService(strapi, 'common').findAllInHierarchy({
        ...flatInput({
          relation,
          filters: getPluginService(strapi, 'gql').graphQLFiltersToStrapiQuery(filters, contentType),
          sort,
        }),
        dropBlockedThreads: true,
      });
    },
  };

}
