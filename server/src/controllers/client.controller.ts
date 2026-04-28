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
          flatInput<clientValidator.FindAllFlatSchema>(result.right),
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
          flatInput<clientValidator.FindAllInHierarchyValidatorSchema>(result.right),
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

  async put(ctx: RequestContext<{ content: string, author: unknown }>) {
    const { user } = ctx.state;
    const configResult = await this.getStoreRepository().get(true);
    if (isRight(configResult)) {
      const config = unwrapEither(configResult);
      const result = clientValidator.updateCommentValidator(config.enabledCollections, {
        ...ctx.params,
        content: ctx.request.body.content,
        author: ctx.request.body.author,
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
      const result = clientValidator.reportAbuseValidator(config, {
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

  async blockComment(
    ctx: RequestContext<object, Pick<clientValidator.ChangeBlockedCommentValidatorSchema, 'relation' | 'commentId'>>
  ) {
    const configResult = await this.getStoreRepository().get(true);
    if (isRight(configResult)) {
      const config = unwrapEither(configResult);
      const result = clientValidator.changeBlockedCommentValidator(config.enabledCollections, ctx.params);
      if (isRight(result)) {
        return this.getService('common').changeBlockedComment(unwrapEither(result).commentId, true);
      }
      throw throwError(ctx, unwrapEither(result));
    }
    throw throwError(ctx, unwrapEither(configResult));
  },

  async unblockComment(
    ctx: RequestContext<object, Pick<clientValidator.ChangeBlockedCommentValidatorSchema, 'relation' | 'commentId'>>
  ) {
    const configResult = await this.getStoreRepository().get(true);
    if (isRight(configResult)) {
      const config = unwrapEither(configResult);
      const result = clientValidator.changeBlockedCommentValidator(config.enabledCollections, ctx.params);
      if (isRight(result)) {
        return this.getService('common').changeBlockedComment(unwrapEither(result).commentId, false);
      }
      throw throwError(ctx, unwrapEither(result));
    }
    throw throwError(ctx, unwrapEither(configResult));
  },

  async blockCommentThread(
    ctx: RequestContext<object, Pick<clientValidator.ChangeBlockedCommentValidatorSchema, 'relation' | 'commentId'>>
  ) {
    const configResult = await this.getStoreRepository().get(true);
    if (isRight(configResult)) {
      const config = unwrapEither(configResult);
      const result = clientValidator.changeBlockedCommentValidator(config.enabledCollections, ctx.params);
      if (isRight(result)) {
        return this.getService('common').changeBlockedCommentThread(unwrapEither(result).commentId, true);
      }
      throw throwError(ctx, unwrapEither(result));
    }
    throw throwError(ctx, unwrapEither(configResult));
  },

  async unblockCommentThread(
    ctx: RequestContext<object, Pick<clientValidator.ChangeBlockedCommentValidatorSchema, 'relation' | 'commentId'>>
  ) {
    const configResult = await this.getStoreRepository().get(true);
    if (isRight(configResult)) {
      const config = unwrapEither(configResult);
      const result = clientValidator.changeBlockedCommentValidator(config.enabledCollections, ctx.params);
      if (isRight(result)) {
        return this.getService('common').changeBlockedCommentThread(unwrapEither(result).commentId, false);
      }
      throw throwError(ctx, unwrapEither(result));
    }
    throw throwError(ctx, unwrapEither(configResult));
  },

  async approveComment(
    ctx: RequestContext<object, Pick<clientValidator.ChangeBlockedCommentValidatorSchema, 'relation' | 'commentId'>>
  ) {
    const configResult = await this.getStoreRepository().get(true);
    if (isRight(configResult)) {
      const config = unwrapEither(configResult);
      const result = clientValidator.changeBlockedCommentValidator(config.enabledCollections, ctx.params);
      if (isRight(result)) {
        return this.getService('common').approveComment(unwrapEither(result).commentId);
      }
      throw throwError(ctx, unwrapEither(result));
    }
    throw throwError(ctx, unwrapEither(configResult));
  },

  async rejectComment(
    ctx: RequestContext<object, Pick<clientValidator.ChangeBlockedCommentValidatorSchema, 'relation' | 'commentId'>>
  ) {
    const configResult = await this.getStoreRepository().get(true);
    if (isRight(configResult)) {
      const config = unwrapEither(configResult);
      const result = clientValidator.changeBlockedCommentValidator(config.enabledCollections, ctx.params);
      if (isRight(result)) {
        return this.getService('common').rejectComment(unwrapEither(result).commentId);
      }
      throw throwError(ctx, unwrapEither(result));
    }
    throw throwError(ctx, unwrapEither(configResult));
  },

  async resolveAbuseReport(
    ctx: RequestContext<object, Pick<clientValidator.ResolveAbuseReportValidatorSchema, 'relation' | 'commentId' | 'reportId'>>
  ) {
    const configResult = await this.getStoreRepository().get(true);
    if (isRight(configResult)) {
      const config = unwrapEither(configResult);
      const result = clientValidator.resolveAbuseReportValidator(config.enabledCollections, ctx.params);
      if (isRight(result)) {
        const { commentId, reportId } = unwrapEither(result);
        return this.getService('common').resolveAbuseReport(commentId, reportId);
      }
      throw throwError(ctx, unwrapEither(result));
    }
    throw throwError(ctx, unwrapEither(configResult));
  },

  async resolveCommentMultipleAbuseReports(
    ctx: RequestContext<{ reportIds: number[] }, Pick<clientValidator.ResolveCommentMultipleAbuseReportsValidatorSchema, 'relation' | 'commentId'>>
  ) {
    const configResult = await this.getStoreRepository().get(true);
    if (isRight(configResult)) {
      const config = unwrapEither(configResult);
      const result = clientValidator.getCommentResolveMultipleAbuseReportsValidator(
        config.enabledCollections,
        { relation: ctx.params.relation, commentId: ctx.params.commentId },
        ctx.request.body,
      );
      if (isRight(result)) {
        const { commentId, reportIds } = unwrapEither(result);
        return this.getService('common').resolveCommentMultipleAbuseReports(commentId, reportIds);
      }
      throw throwError(ctx, unwrapEither(result));
    }
    throw throwError(ctx, unwrapEither(configResult));
  },

  async resolveAllAbuseReportsForComment(
    ctx: RequestContext<object, Pick<clientValidator.ResolveAllAbuseReportsForCommentValidatorSchema, 'relation' | 'commentId'>>
  ) {
    const configResult = await this.getStoreRepository().get(true);
    if (isRight(configResult)) {
      const config = unwrapEither(configResult);
      const result = clientValidator.changeBlockedCommentValidator(config.enabledCollections, ctx.params);
      if (isRight(result)) {
        return this.getService('common').resolveAllAbuseReportsForComment(unwrapEither(result).commentId);
      }
      throw throwError(ctx, unwrapEither(result));
    }
    throw throwError(ctx, unwrapEither(configResult));
  },

  async resolveAllAbuseReportsForThread(
    ctx: RequestContext<object, Pick<clientValidator.ResolveAllAbuseReportsForThreadValidatorSchema, 'relation' | 'commentId'>>
  ) {
    const configResult = await this.getStoreRepository().get(true);
    if (isRight(configResult)) {
      const config = unwrapEither(configResult);
      const result = clientValidator.changeBlockedCommentValidator(config.enabledCollections, ctx.params);
      if (isRight(result)) {
        return this.getService('common').resolveAllAbuseReportsForThread(
          Number(unwrapEither(result).commentId),
        );
      }
      throw throwError(ctx, unwrapEither(result));
    }
    throw throwError(ctx, unwrapEither(configResult));
  },

  async resolveMultipleAbuseReports(
    ctx: RequestContext<{ reportIds: number[] }, Pick<clientValidator.ResolveMultipleAbuseReportsValidatorSchema, 'relation'>>
  ) {
    const configResult = await this.getStoreRepository().get(true);
    if (isRight(configResult)) {
      const config = unwrapEither(configResult);
      const result = clientValidator.resolveMultipleAbuseReportsValidator(
        config.enabledCollections,
        ctx.params.relation,
        ctx.request.body,
      );
      if (isRight(result)) {
        const { reportIds } = unwrapEither(result);
        return this.getService('common').resolveMultipleAbuseReports(reportIds);
      }
      throw throwError(ctx, unwrapEither(result));
    }
    throw throwError(ctx, unwrapEither(configResult));
  },
});

export default controllers;
