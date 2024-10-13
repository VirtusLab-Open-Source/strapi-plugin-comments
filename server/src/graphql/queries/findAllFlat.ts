import {
  Id,
  IServiceCommon,
  IServiceGraphQL,
  StrapiGraphQLContext,
  ToBeFixed,
} from "../../@types";

import { isEmpty } from "lodash";
import contentType from "../../content-types/comments/schema";
import { flatInput } from "../../controllers/utils/parsers";
import { getPluginService } from "../../utils/functions";

type ResponseFindAllResolverProps = {
  relation: Id;
  filters: ToBeFixed;
  sort: ToBeFixed;
  pagination: ToBeFixed;
};

export = ({ strapi, nexus }: StrapiGraphQLContext) => {
  const { nonNull, stringArg } = nexus;
  const { service: getService } = strapi.plugin("graphql");
  const { args } = getService("internals");

  return {
    type: "ResponseFindAll",
    args: {
      relation: nonNull(stringArg()),
      filters:
        getPluginService<IServiceGraphQL>("gql").buildContentTypeFilters(
          contentType
        ),
      pagination: args.PaginationArg,
      sort: args.SortArg,
    },
    // @ts-ignore
    async resolve(obj: Object, args: ResponseFindAllResolverProps) {
      const { relation, filters, sort, pagination } = args;
      return await getPluginService<IServiceCommon>("common").findAllFlat(
        flatInput({
          relation,
          query: getPluginService<IServiceGraphQL>(
            "gql"
          ).graphQLFiltersToStrapiQuery(filters, contentType),
          sort,
          pagination: pagination
            ? {
                ...pagination,
                withCount: !isEmpty(pagination),
              }
            : undefined,
        }),
        undefined
      );
    },
  };
};
