import { isEmpty } from 'lodash';
import { CoreStrapi } from '../../@types-v5';
import { Nexus } from '../../@types-v5/graphql';
import { flatInput } from '../../controllers/utils/parsers';
import { getModelUid } from '../../repositories/utils';
import { getPluginService } from '../../utils/getPluginService';

export default (strapi: CoreStrapi, nexus: Nexus) => {
  const { nonNull, stringArg } = nexus;
  const { service: getService } = strapi.plugin('graphql');
  const { args } = getService('internals');

  const contentType = strapi.contentType(getModelUid(strapi, 'comment'));

  return {
    type: 'ResponseFindAll',
    args: {
      relation: nonNull(stringArg()),
      filters: getPluginService(strapi, 'gql').buildContentTypeFilters(contentType),
      pagination: args.PaginationArg,
      sort: args.SortArg,
    },
    async resolve(obj: Object, args) {
      const { relation, filters, sort, pagination } = args;
      return await getPluginService(strapi, 'common').findAllFlat(
        flatInput({
          relation,
          filters: getPluginService(strapi, 'gql').graphQLFiltersToStrapiQuery(filters, contentType),
          sort,
          pagination: pagination ? { ...pagination, withCount: !isEmpty(pagination) } : undefined,
        }),
        undefined,
      );
    },
  };
};
