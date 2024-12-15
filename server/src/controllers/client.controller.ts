import { RequestContext, StrapiContext } from '../@types';
import { getStoreRepository } from '../repositories';
import { PluginServices } from '../services';
import { AUTHOR_TYPE } from '../utils/constants';
import { isRight, unwrapEither } from '../utils/Either';
import { getPluginService } from '../utils/getPluginService';
import { throwError } from '../utils/throwError';
import { client as clientValidator } from '../validators/api';
import { flatInput } from './utils/parsers';

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
      console.log('config.enabledCollections', config.enabledCollections);
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
      const result = clientValidator.findAllFlatValidator(config.enabledCollections, ctx.params.relation, ctx.query);
      if (isRight(result)) {
        return this.getService('common').findAllFlat(
          flatInput<clientValidator.FindAllFlatSchema>(result.right)
        );
      }
      throw throwError(ctx, unwrapEither(result));
    }
    throw throwError(ctx, unwrapEither(configResult));
  },

  async findAllInHierarchy(ctx: RequestContext<object, Pick<clientValidator.FindAllInHierarchyValidatorSchema, 'relation'>>) {
    const configResult = await this.getStoreRepository().get(true);
    if (isRight(configResult)) {
      const config = unwrapEither(configResult);
      const result = clientValidator.findAllInHierarchyValidator(config.enabledCollections, ctx.params.relation, ctx.query);
      if (isRight(result)) {
        return this.getService('common').findAllInHierarchy(
          flatInput<clientValidator.FindAllInHierarchyValidatorSchema>(result.right)
        );
      }
      throw throwError(ctx, unwrapEither(result));
    }
    throw throwError(ctx, unwrapEither(configResult));
  },

  async findAllPerAuthor(ctx: RequestContext<object, Pick<clientValidator.FindAllPerAuthorValidatorSchema, 'authorId' | 'type'>>) {
    const result = clientValidator.findAllPerAuthorValidator(ctx.params, ctx.query);
    if (isRight(result)) {
      return this.getService('common').findAllPerAuthor(
        flatInput<clientValidator.FindAllPerAuthorValidatorSchema>(result.right),
        ctx.params.type ? ![AUTHOR_TYPE.GENERIC.toLowerCase(), AUTHOR_TYPE.GENERIC].includes(ctx.params.type) : false,
      );
    }
    throw throwError(ctx, unwrapEither(result));
  },

  async put(ctx: RequestContext) {
    const { user } = ctx.state;
    const configResult = await this.getStoreRepository().get(true);
    if (isRight(configResult)) {
      const config = unwrapEither(configResult);
      const result = clientValidator.updateCommentValidator(config.enabledCollections, {
        ...ctx.query,
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

  async reportAbuse(ctx: RequestContext) {
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

  async removeComment(ctx: RequestContext) {
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
