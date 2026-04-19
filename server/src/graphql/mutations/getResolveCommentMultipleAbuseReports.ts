import { CoreStrapi } from '../../@types';
import { Nexus } from '../../@types/graphql';
import { getStoreRepository } from '../../repositories';
import { getPluginService } from '../../utils/getPluginService';
import { isRight, unwrapEither } from '../../utils/Either';
import { client as clientValidator } from '../../validators/api';

const toBatchResult = (result: { count?: number } | null | undefined) => ({
  count: typeof result?.count === 'number' ? result.count : 0,
});

export const getResolveCommentMultipleAbuseReports = (strapi: CoreStrapi, nexus: Nexus) => {
  const { nonNull } = nexus;

  return {
    type: nonNull('ReportsResolveBatch'),
    args: {
      input: nonNull('ResolveCommentMultipleAbuseReportsInput'),
    },
    async resolve(
      _: object,
      args: { input: { id: string; relation: string; reportIds: number[] } },
    ) {
      const { input } = args;
      const { id, relation, reportIds } = input;
      const configResult = await getStoreRepository(strapi).get(true);
      if (!isRight(configResult)) {
        throw unwrapEither(configResult);
      }
      const config = unwrapEither(configResult);
      const validated = clientValidator.resolveCommentMultipleAbuseReportsValidator(
        config.enabledCollections,
        {
          relation,
          commentId: id,
          reportIds,
        },
      );
      if (!isRight(validated)) {
        throw unwrapEither(validated);
      }
      const { commentId, reportIds: ids } = unwrapEither(validated);
      const result = await getPluginService(strapi, 'admin').resolveCommentMultipleAbuseReports({
        id: commentId,
        reportIds: ids,
      });
      return toBatchResult(result);
    },
  };
};
