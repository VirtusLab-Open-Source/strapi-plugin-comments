import { Id, RequestContext, StrapiContext } from '../@types-v5';
import { PluginServices } from '../services';
import { isRight, unwrapEither } from '../utils/Either';
import { getPluginService } from '../utils/getPluginService';
import { throwError } from '../utils/throwError';
import { admin as adminValidator } from '../validators/api';

type RequestContextWithId<T = object> = RequestContext<T, { id: string }>;
const controllers = ({ strapi }: StrapiContext) => ({
  getService<T extends keyof PluginServices>(name: T): PluginServices[T] {
    return getPluginService(strapi, name);
  },
  async findAll(ctx: RequestContext) {
    const either = adminValidator.getCommentFindAllValidator(ctx.query);
    if (isRight(either)) {
      return this.getService('admin').findAll(unwrapEither(either));
    }
    throw throwError(ctx, unwrapEither(either));
  },

  async findReports(ctx: RequestContext) {
    const either = adminValidator.getReportFindReportsValidator(ctx.query);
    if (isRight(either)) {
      return this.getService('admin').findReports(unwrapEither(either));
    }
    throw throwError(ctx, unwrapEither(either));
  },

  async findOne(ctx: RequestContextWithId) {
    const either = adminValidator.getCommentFindOneValidator(ctx.params.id, ctx.query);
    if (isRight(either)) {
      return this.getService('admin').findOneAndThread(unwrapEither(either));
    }
    throw throwError(ctx, unwrapEither(either));
  },

  async blockComment(ctx: RequestContextWithId) {
    const either = adminValidator.getIdValidator(ctx.params);
    if (isRight(either)) {
      return this.getService('admin').changeBlockedComment(unwrapEither(either).id, true);
    }
    throw throwError(ctx, unwrapEither(either));
  },

  async unblockComment(ctx: RequestContextWithId) {
    const either = adminValidator.getIdValidator(ctx.params);
    if (isRight(either)) {
      return this.getService('admin').changeBlockedComment(unwrapEither(either).id, false);
    }
    throw throwError(ctx, unwrapEither(either));
  },

  async deleteComment(ctx: RequestContextWithId) {
    const either = adminValidator.getIdValidator(ctx.params);
    if (isRight(either)) {
      return this.getService('admin').deleteComment(unwrapEither(either).id);
    }
    throw throwError(ctx, unwrapEither(either));
  },

  async blockCommentThread(ctx: RequestContextWithId) {
    const either = adminValidator.getIdValidator(ctx.params);
    if (isRight(either)) {
      return this.getService('admin').blockCommentThread(unwrapEither(either).id, true);
    }
    throw throwError(ctx, unwrapEither(either));
  },

  async unblockCommentThread(ctx: RequestContextWithId) {
    const either = adminValidator.getIdValidator(ctx.params);
    if (isRight(either)) {
      return this.getService('admin').blockCommentThread(unwrapEither(either).id, false);
    }
    throw throwError(ctx, unwrapEither(either));
  },

  async resolveAbuseReport(ctx: RequestContext<object, { id: string, reportId: string }>) {
    const either = adminValidator.getCommentResolveAbuseReportValidator(ctx.params);
    if (isRight(either)) {
      return this.getService('admin').resolveAbuseReport(unwrapEither(either));
    }
    throw throwError(ctx, unwrapEither(either));
  },

  async resolveCommentMultipleAbuseReports(ctx: RequestContextWithId<Array<Id>>) {
    const either = adminValidator.getCommentResolveMultipleAbuseReportsValidator({
      ...ctx.request.body,
      id: ctx.params.id,
    });
    if (isRight(either)) {
      return this.getService('admin').resolveCommentMultipleAbuseReports(unwrapEither(either));
    }
    throw throwError(ctx, unwrapEither(either));
  },

  async resolveAllAbuseReportsForComment(ctx: RequestContextWithId) {
    const either = adminValidator.getIdValidator(ctx.params);
    if (isRight(either)) {
      return this.getService('admin').resolveAllAbuseReportsForComment(unwrapEither(either).id);
    }
    throw throwError(ctx, unwrapEither(either));
  },

  async resolveAllAbuseReportsForThread(ctx: RequestContextWithId) {
    const either = adminValidator.getIdValidator(ctx.params);
    if (isRight(either)) {
      return this.getService('admin').resolveAllAbuseReportsForThread(unwrapEither(either).id);
    }
    throw throwError(ctx, unwrapEither(either));
  },

  async resolveMultipleAbuseReports(ctx: RequestContext<Array<Id>>) {
    const either = adminValidator.getReportsMultipleAbuseValidator(ctx.request.body);
    if (isRight(either)) {
      return this.getService('admin').resolveMultipleAbuseReports(unwrapEither(either));
    }
    throw throwError(ctx, unwrapEither(either));
  },

  async postComment(ctx: RequestContext<Omit<adminValidator.CommentPostValidatorSchema, 'id'>, Pick<adminValidator.CommentPostValidatorSchema, 'id'>>) {
    const either = adminValidator.getCommentPostValidator({
      id: ctx.params.id,
      content: ctx.request.body.content,
      author: ctx.request.body.author,
    });
    if (isRight(either)) {
      return this.getService('admin').postComment(unwrapEither(either));
    }
    throw throwError(ctx, unwrapEither(either));
  },

  async updateComment(ctx: RequestContext<Omit<adminValidator.CommentPostValidatorSchema, 'id'>, Pick<adminValidator.CommentPostValidatorSchema, 'id'>>) {
    const either = adminValidator.getUpdateCommentValidator({
      id: ctx.params.id,
      content: ctx.request.body.content,
    });
    if (isRight(either)) {
      return this.getService('admin').updateComment(unwrapEither(either));
    }
    throw throwError(ctx, unwrapEither(either));
  },

  async approveComment(ctx: RequestContext<object, adminValidator.IdValidatorSchema>) {
    const either = adminValidator.getIdValidator(ctx.params);
    if (isRight(either)) {
      return this.getService('admin').approveComment(unwrapEither(either).id);
    }
    throw throwError(ctx, unwrapEither(either));
  },

  async rejectComment(ctx: RequestContext<object, adminValidator.IdValidatorSchema>) {
    const either = adminValidator.getIdValidator(ctx.params);
    if (isRight(either)) {
      return this.getService('admin').rejectComment(unwrapEither(either).id);
    }
    throw throwError(ctx, unwrapEither(either));
  },
});

export default controllers;
