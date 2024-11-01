import { RequestContext, StrapiContext } from '../@types-v5';
import { getStoreRepository } from '../repositories';
import { PluginServices } from '../services';
import { AUTHOR_TYPE } from '../utils/constants';
import { isRight, unwrapEither } from '../utils/Either';
import { getPluginService } from '../utils/getPluginService';
import { throwError } from '../utils/throwError';
import { client as clientValidator } from '../validators/api';

const controllers = ({ strapi }: StrapiContext) => ({
  getService<T extends keyof PluginServices>(name: T): PluginServices[T] {
    return getPluginService(strapi, name);
  },
  getStoreRepository() {
    return getStoreRepository(strapi);
  },
  async post(ctx: RequestContext<object, Pick<clientValidator.NewCommentValidatorSchema, 'relation'>>) {
    const configResult = await this.getStoreRepository().get(true);
    if (isRight(configResult)) {
      const config = unwrapEither(configResult);
      const result = clientValidator.newCommentValidator(config.enabledCollections, ctx.params.relation, ctx.request.body);
      if (isRight(result)) {
        return this.getService('client').create(result.right, ctx.state.user);
      }
      throw throwError(ctx, unwrapEither(result));
    }
    throw throwError(ctx, unwrapEither(configResult));
  },

  async findAllFlat(ctx: RequestContext<object, Pick<clientValidator.FindAllFlatSchema, 'relation'>>) {
    const configResult = await this.getStoreRepository().get(true);
    if (isRight(configResult)) {
      const config = unwrapEither(configResult);
      const result = clientValidator.findAllFlatValidator(config.enabledCollections, ctx.params.relation, ctx.request.body);
      if (isRight(result)) {
        return this.getService('common').findAllFlat(result.right);
      }
      throw throwError(ctx, unwrapEither(result));
    }
    throw throwError(ctx, unwrapEither(configResult));
  },

  async findAllInHierarchy(ctx: RequestContext<object, Pick<clientValidator.FindAllInHierarchyValidatorSchema, 'relation'>>) {
    const configResult = await this.getStoreRepository().get(true);
    if (isRight(configResult)) {
      const config = unwrapEither(configResult);
      const result = clientValidator.findAllInHierarchyValidator(config.enabledCollections, ctx.params.relation, ctx.request.body);
      if (isRight(result)) {
        return this.getService('common').findAllInHierarchy(result.right);
      }
      throw throwError(ctx, unwrapEither(result));
    }
    throw throwError(ctx, unwrapEither(configResult));
  },

  async findAllPerAuthor(ctx: RequestContext<object, Pick<clientValidator.FindAllPerAuthorValidatorSchema, 'authorId' | 'type'>>) {
    const result = clientValidator.findAllPerAuthorValidator(ctx.params, ctx.request.body);
    if (isRight(result)) {
      return this.getService('common').findAllPerAuthor(
        result.right,
        ![AUTHOR_TYPE.GENERIC.toLowerCase(), AUTHOR_TYPE.GENERIC].includes(ctx.params.type),
      );
    }
    throw throwError(ctx, unwrapEither(result));
  },

  async put(ctx: RequestContext<any, any>) {
    const { user } = ctx.state;
    const configResult = await this.getStoreRepository().get(true);
    if (isRight(configResult)) {
      const config = unwrapEither(configResult);
      const result = clientValidator.updateCommentValidator(config.enabledCollections, {
        ...ctx.request.body,
        ...ctx.params,
      });
      if (isRight(result)) {
        return await this.getService('client').update(
          result.right,
          user,
        );
      }
      throw throwError(ctx, unwrapEither(result));

    }
    throw throwError(ctx, unwrapEither(configResult));
  },

  async reportAbuse(ctx: RequestContext<any, any>) {
    const { state } = ctx;
    const { user } = state;
    const configResult = await this.getStoreRepository().get(true);
    if (isRight(configResult)) {
      const config = unwrapEither(configResult);
      const result = clientValidator.reportAbuseValidator(config.enabledCollections, {
        ...ctx.request.body,
        ...ctx.params,
      });
      if (isRight(result)) {
        return await this.getService('client').reportAbuse(
          result.right,
          user,
        );
      }
      throw throwError(ctx, unwrapEither(result));
    }
    throw throwError(ctx, unwrapEither(configResult));
  },

  async removeComment(ctx: RequestContext<any, any, any>) {
    const { state } = ctx;
    const { user } = state;
    const configResult = await this.getStoreRepository().get(true);
    if (isRight(configResult)) {
      const config = unwrapEither(configResult);
      const result = clientValidator.removeCommentValidator(config.enabledCollections, {
        ...ctx.query,
        ...ctx.params,
      });
      if (isRight(result)) {
        return await this.getService('client').markAsRemoved(
          result.right,
          user,
        );
      }
      throw throwError(ctx, unwrapEither(result));
    }
    throw throwError(ctx, unwrapEither(configResult));
  },
});

export default controllers;
