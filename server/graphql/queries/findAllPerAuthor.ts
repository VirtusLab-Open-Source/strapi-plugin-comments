import {
  Id,
  IServiceCommon,
  IServiceGraphQL,
  StrapiGraphQLContext,
  ToBeFixed,
} from "../../../types";

import { isEmpty } from "lodash";
import contentType from "../../../content-types/comment";
import { flatInput } from "../../controllers/utils/parsers";
import { getPluginService } from "../../utils/functions";
import { AUTHOR_TYPE } from "../../utils/constants";

type ResponseFindAllPerAuthorResolverProps = {
  authorId: Id;
  authorType: 'STRAPI' | 'GENERIC' | undefined;
  filters: ToBeFixed;
  sort: ToBeFixed;
  pagination: ToBeFixed;
};

export = ({ strapi, nexus }: StrapiGraphQLContext) => {
  const { nonNull, intArg, arg } = nexus;
  const { service: getService } = strapi.plugin("graphql");
  const { args } = getService("internals");
  const {
    naming: { getFiltersInputTypeName },
  } = getService("utils");

  return {
    type: "ResponseFindAllPerAuthor",
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
      return await getPluginService<IServiceCommon>("common").findAllPerAuthor(
        flatInput({
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
        authorId,
        isStrapiUser
      );
    },
  };
};
