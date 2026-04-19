import { CoreStrapi } from '../../@types';
import { Nexus } from '../../@types/graphql';
import { getStoreRepository } from '../../repositories';
import { getPluginService } from '../../utils/getPluginService';
import { isRight, unwrapEither } from '../../utils/Either';
import { client as clientValidator } from '../../validators/api';

const toBatchResult = (result: { count?: number } | null | undefined) => ({
  count: typeof result?.count === 'number' ? result.count : 0,
});

export const getResolveMultipleAbuseReports = (strapi: CoreStrapi, nexus: Nexus) => {
  const { nonNull } = nexus;

  return {
    type: nonNull('ReportsResolveBatch'),
    args: {
      input: nonNull('ResolveMultipleAbuseReportsInput'),
    },
    async resolve(_: object, args: { input: { relation: string; reportIds: number[] } }) {
      const { input } = args;
      const { relation, reportIds } = input;
      const configResult = await getStoreRepository(strapi).get(true);
      if (!isRight(configResult)) {
        throw unwrapEither(configResult);
      }
      const config = unwrapEither(configResult);
      const validated = clientValidator.resolveMultipleAbuseReportsValidator(
        config.enabledCollections,
        relation,
        { reportIds },
      );
      if (!isRight(validated)) {
        throw unwrapEither(validated);
      }
      const { reportIds: ids } = unwrapEither(validated);
      const result = await getPluginService(strapi, 'admin').resolveMultipleAbuseReports({
        reportIds: ids,
      });
      return toBatchResult(result);
    },
  };
};
