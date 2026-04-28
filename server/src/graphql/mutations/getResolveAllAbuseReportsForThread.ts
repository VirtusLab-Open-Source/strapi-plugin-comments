import { CoreStrapi } from '../../@types';
import { Nexus } from '../../@types/graphql';
import { getStoreRepository } from '../../repositories';
import { getPluginService } from '../../utils/getPluginService';
import { isRight, unwrapEither } from '../../utils/Either';
import { client as clientValidator } from '../../validators/api';

const toBatchResult = (result: { count?: number } | null | undefined) => ({
  count: typeof result?.count === 'number' ? result.count : 0,
});

export const getResolveAllAbuseReportsForThread = (strapi: CoreStrapi, nexus: Nexus) => {
  const { nonNull } = nexus;

  return {
    type: nonNull('ReportsResolveBatch'),
    args: {
      input: nonNull('ModerateCommentInput'),
    },
    async resolve(_: object, args: { input: { id: string; relation: string } }) {
      const { input } = args;
      const { id, relation } = input;
      const configResult = await getStoreRepository(strapi).get(true);
      if (!isRight(configResult)) {
        throw unwrapEither(configResult);
      }
      const config = unwrapEither(configResult);
      const validated = clientValidator.changeBlockedCommentValidator(config.enabledCollections, {
        relation,
        commentId: id,
      });
      if (!isRight(validated)) {
        throw unwrapEither(validated);
      }
      const result = await getPluginService(strapi, 'common').resolveAllAbuseReportsForThread(
        Number(unwrapEither(validated).commentId),
      );
      return toBatchResult(result);
    },
  };
};
