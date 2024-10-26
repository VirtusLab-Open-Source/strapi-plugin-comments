import { RequestContext, StrapiContext } from '../@types-v5';
import { getStoreRepository } from '../repositories';
import { PluginServices } from '../services';
import { isRight, unwrapEither } from '../utils/Either';
import { getPluginService } from '../utils/getPluginService';
import { throwError } from '../utils/throwError';
import { CommentData, FindAllFlatCommentsValidatorSchema, getCreateNewCommentValidator, getFindAllFlatCommentsValidator } from '../validators/api';

const controllers = ({ strapi }: StrapiContext) => {
  const storeRepository = getStoreRepository(strapi);
  const clientService = getPluginService(strapi, 'client');
  const commonService = getPluginService(strapi, 'common');

  return ({
    getService<T extends keyof PluginServices>(name?: T) {
      return getPluginService(strapi, name ?? 'client');
    },
    async post(ctx: RequestContext<object, Pick<CommentData, 'relation'>>) {
      const configResult = await storeRepository.get(true);
      if (isRight(configResult)) {
        const config = unwrapEither(configResult);
        const result = getCreateNewCommentValidator(config.enabledCollections, ctx.params.relation, ctx.request.body);
        if (isRight(result)) {
          return clientService.create(result.right, ctx.state.user);
        }
        throw throwError(ctx, unwrapEither(result));
      }
      throw throwError(ctx, unwrapEither(configResult));
    },

    async findAllFlat(ctx: RequestContext<object, Pick<FindAllFlatCommentsValidatorSchema, 'relation'>>) {
      const configResult = await storeRepository.get(true);
      if (isRight(configResult)) {
        const config = unwrapEither(configResult);
        const result = getFindAllFlatCommentsValidator(config.enabledCollections, ctx.params.relation, ctx.request.body);
        if (isRight(result)) {
          return commonService.findAllFlat(result.right);
        }
        throw throwError(ctx, unwrapEither(result));

      }

      throw throwError(ctx, unwrapEither(configResult));

    },

    async findAllInHierarchy() {
    },

    async findAllPerAuthor() {
    },

    async put() {
    },

    async reportAbuse() {
    },

    async removeComment() {
    },
  });
};

export default controllers;
