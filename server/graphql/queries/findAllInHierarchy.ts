import { Id } from "strapi-typed";
import {
  IServiceCommon,
  IServiceGraphQL,
  StrapiGraphQLContext,
  ToBeFixed,
} from "../../../types";

import contentType from "../../../content-types/comment";
import { flatInput } from "../../controllers/utils/parsers";
import { getPluginService } from "../../utils/functions";

type findAllInHierarchyProps = {
  relation: Id;
  filters: ToBeFixed;
  sort: ToBeFixed;
};

export = ({ strapi, nexus }: StrapiGraphQLContext) => {
  const { nonNull, list, stringArg } = nexus;
  const { service: getService } = strapi.plugin("graphql");
  const { args } = getService("internals");

  return {
    type: nonNull(list("CommentNested")),
    args: {
      relation: nonNull(stringArg()),
      sort: args.SortArg,
    },
    // @ts-ignore
    async resolve(obj: Object, args: findAllInHierarchyProps) {
      const { relation, filters, sort } = args;
      return await getPluginService<IServiceCommon>(
        "common"
      ).findAllInHierarchy({
        ...flatInput(
          relation,
          getPluginService<IServiceGraphQL>("gql").graphQLFiltersToStrapiQuery(
            filters,
            contentType
          ),
          sort
        ),
        dropBlockedThreads: true,
      });
    },
  };
};
