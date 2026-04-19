import { CoreStrapi } from '../../@types';
import { Nexus } from '../../@types/graphql';
import { getStoreRepository } from '../../repositories';
import { getPluginService } from '../../utils/getPluginService';
import { isRight, unwrapEither } from '../../utils/Either';
import { client as clientValidator } from '../../validators/api';

export const getResolveAbuseReport = (strapi: CoreStrapi, nexus: Nexus) => {
  const { nonNull } = nexus;

  return {
    type: nonNull('Report'),
    args: {
      input: nonNull('ResolveAbuseReportInput'),
    },
    async resolve(
      _: object,
      args: { input: { id: string; relation: string; reportId: number } },
    ) {
      const { input } = args;
      const { id, relation, reportId } = input;
      const configResult = await getStoreRepository(strapi).get(true);
      if (!isRight(configResult)) {
        throw unwrapEither(configResult);
      }
      const config = unwrapEither(configResult);
      const validated = clientValidator.resolveAbuseReportValidator(config.enabledCollections, {
        relation,
        commentId: id,
        reportId,
      });
      if (!isRight(validated)) {
        throw unwrapEither(validated);
      }
      const { commentId, reportId: rid } = unwrapEither(validated);
      return getPluginService(strapi, 'admin').resolveAbuseReport({ id: commentId, reportId: rid });
    },
  };
};
