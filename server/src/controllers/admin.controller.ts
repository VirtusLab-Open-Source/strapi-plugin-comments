import { Id, RequestContext, StrapiContext } from '../@types-v5';
import { isRight, unwrapEither } from '../utils/Either';
import { getPluginService } from '../utils/getPluginService';
import { throwError } from '../utils/throwError';
import { getCommentQueryValidator, getFindOneValidator, getIdValidator, getPostCommentValidator, getReportQueryValidator, getResolveAbuseReportValidator, getResolveCommentMultipleAbuseReportsValidator, getUpdateCommentValidator, IdValidatorSchema, PostCommentValidatorSchema } from '../validators';

type RequestContextWithId<T = unknown> = RequestContext<T, { id: string }>;
const controllers = ({ strapi }: StrapiContext) => {
  const adminService = getPluginService(strapi, 'admin');

  return ({
    async findAll(ctx: RequestContext) {
      const either = getCommentQueryValidator(ctx.query);
      if (isRight(either)) {
        return adminService.findAll(unwrapEither(either));
      }
      throw throwError(ctx, unwrapEither(either));
    },

    async findReports(ctx: RequestContext) {
      const either = getReportQueryValidator(ctx.query);
      if (isRight(either)) {
        return adminService.findReports(unwrapEither(either));
      }
      throw throwError(ctx, unwrapEither(either));
    },

    async findOne(ctx: RequestContextWithId) {
      const either = getFindOneValidator(ctx.params.id, ctx.query);
      if (isRight(either)) {
        return adminService.findOneAndThread(unwrapEither(either));
      }
      throw throwError(ctx, unwrapEither(either));
    },

    async blockComment(ctx: RequestContextWithId) {
      const either = getIdValidator(ctx.params);
      if (isRight(either)) {
        return adminService.changeBlockedComment(unwrapEither(either).id, true);
      }
      throw throwError(ctx, unwrapEither(either));
    },

    async unblockComment(ctx: RequestContextWithId) {
      const either = getIdValidator(ctx.params);
      if (isRight(either)) {
        return adminService.changeBlockedComment(unwrapEither(either).id, true);
      }
      throw throwError(ctx, unwrapEither(either));
    },

    async deleteComment(ctx: RequestContextWithId) {
      const either = getIdValidator(ctx.params);
      if (isRight(either)) {
        return adminService.deleteComment(unwrapEither(either).id);
      }
      throw throwError(ctx, unwrapEither(either));
    },

    async blockCommentThread(ctx: RequestContextWithId) {
      const either = getIdValidator(ctx.params);
      if (isRight(either)) {
        return adminService.blockCommentThread(unwrapEither(either).id, true);
      }
      throw throwError(ctx, unwrapEither(either));
    },

    async unblockCommentThread(ctx: RequestContextWithId) {
      const either = getIdValidator(ctx.params);
      if (isRight(either)) {
        return adminService.blockCommentThread(unwrapEither(either).id, false);
      }
      throw throwError(ctx, unwrapEither(either));
    },

    async resolveAbuseReport(ctx: RequestContext<unknown, { id: string, reportId: string }>) {
      const either = getResolveAbuseReportValidator(ctx.params);
      if (isRight(either)) {
        return adminService.resolveAbuseReport(unwrapEither(either));
      }
      throw throwError(ctx, unwrapEither(either));
    },

    async resolveCommentMultipleAbuseReports(ctx: RequestContextWithId<Array<Id>>) {
      const either = getResolveCommentMultipleAbuseReportsValidator({
        ...ctx.request.body,
        id: ctx.params.id,
      });
      if (isRight(either)) {
        return adminService.resolveCommentMultipleAbuseReports(unwrapEither(either));
      }
      throw throwError(ctx, unwrapEither(either));
    },

    async resolveAllAbuseReportsForComment(ctx: RequestContextWithId) {
      const either = getIdValidator(ctx.params);
      if (isRight(either)) {
        return adminService.resolveAllAbuseReportsForComment(unwrapEither(either).id);
      }
      throw throwError(ctx, unwrapEither(either));
    },

    async resolveAllAbuseReportsForThread(ctx: RequestContextWithId) {
      const either = getIdValidator(ctx.params);
      if (isRight(either)) {
        return adminService.resolveAllAbuseReportsForThread(unwrapEither(either).id);
      }
      throw throwError(ctx, unwrapEither(either));
    },

    async resolveMultipleAbuseReports(ctx: RequestContext<Array<Id>>) {
      const either = getResolveCommentMultipleAbuseReportsValidator({
        reportIds: ctx.request.body,
      });
      if (isRight(either)) {
        return adminService.resolveMultipleAbuseReports(unwrapEither(either));
      }
      throw throwError(ctx, unwrapEither(either));
    },

    async postComment(ctx: RequestContext<Omit<PostCommentValidatorSchema, 'id'>, Pick<PostCommentValidatorSchema, 'id'>>) {
      const either = getPostCommentValidator({
        id: ctx.params.id,
        content: ctx.request.body.content,
        author: ctx.request.body.author,
      });
      if (isRight(either)) {
        return adminService.postComment(unwrapEither(either));
      }
      throw throwError(ctx, unwrapEither(either));
    },

    async updateComment(ctx: RequestContext<Omit<PostCommentValidatorSchema, 'id'>, Pick<PostCommentValidatorSchema, 'id'>>) {
      const either = getUpdateCommentValidator({
        id: ctx.params.id,
        content: ctx.request.body.content,
      });
      if (isRight(either)) {
        return adminService.updateComment(unwrapEither(either));
      }
      throw throwError(ctx, unwrapEither(either));
    },

    async approveComment(ctx: RequestContext<unknown, IdValidatorSchema>) {
      const either = getIdValidator(ctx.params);
      if (isRight(either)) {
        return adminService.approveComment(unwrapEither(either).id);
      }
      throw throwError(ctx, unwrapEither(either));
    },

    async rejectComment(ctx: RequestContext<unknown, IdValidatorSchema>) {
      const either = getIdValidator(ctx.params);
      if (isRight(either)) {
        return adminService.rejectComment(unwrapEither(either).id);
      }
      throw throwError(ctx, unwrapEither(either));
    },
  });
};

export default controllers;
