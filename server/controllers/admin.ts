import { StrapiRequestContext } from "strapi-typed";
import {
  AdminFindAllProps,
  AdminFindOneAndThreadProps,
  AdminPaginatedResponse,
  AdminSinglePageResponse,
  Comment,
  CommentReport,
  IControllerAdmin,
  IServiceAdmin,
  SettingsCommentsPluginConfig,
  ThrowablePromisedResponse,
  ToBeFixed,
  ViewCommentsPluginConfig,
} from "../../types";

import { getPluginService } from "./../utils/functions";
import { parseParams, throwError } from "./utils/functions";

const controllers: IControllerAdmin = {
  getService<T>(name = "admin") {
    return getPluginService<T>(name);
  },

  async config(
    ctx: StrapiRequestContext
  ): ThrowablePromisedResponse<ViewCommentsPluginConfig> {
    try {
      return await this.getService<IServiceAdmin>().config<ViewCommentsPluginConfig>();
    } catch (e) {
      throw throwError(ctx, e);
    }
  },

  async settingsConfig(
    ctx: StrapiRequestContext
  ): ThrowablePromisedResponse<SettingsCommentsPluginConfig> {
    try {
      return this.getService<IServiceAdmin>().config<SettingsCommentsPluginConfig>(
        true
      );
    } catch (e) {
      throw throwError(ctx, e);
    }
  },

  async settingsUpdateConfig(
    ctx: StrapiRequestContext<SettingsCommentsPluginConfig>
  ): ThrowablePromisedResponse<SettingsCommentsPluginConfig> {
    try {
      const {
        request: { body },
      } = ctx;
      return this.getService<IServiceAdmin>().updateConfig(body);
    } catch (e) {
      throw throwError(ctx, e);
    }
  },

  async settingsRestoreConfig(
    ctx: StrapiRequestContext
  ): ThrowablePromisedResponse<SettingsCommentsPluginConfig> {
    try {
      return this.getService<IServiceAdmin>().restoreConfig();
    } catch (e) {
      throw throwError(ctx, e);
    }
  },

  async settingsRestart(
    ctx: StrapiRequestContext
  ): ThrowablePromisedResponse<any> {
    try {
      await this.getService<IServiceAdmin>().restart();
      return ctx.send({ status: 200 });
    } catch (e) {
      throw throwError(ctx, e);
    }
  },

  async findAll(
    ctx: StrapiRequestContext<{}, AdminFindAllProps>
  ): Promise<AdminPaginatedResponse<Comment>> {
    return this.getService<IServiceAdmin>().findAll(ctx.query);
  },

  async findOne(
    ctx: StrapiRequestContext<{}, AdminFindOneAndThreadProps>
  ): ThrowablePromisedResponse<AdminSinglePageResponse> {
    const { params = {}, query } = ctx;
    const { id }: ToBeFixed = parseParams(params);
    try {
      return await this.getService<IServiceAdmin>().findOneAndThread(id, query);
    } catch (e) {
      throw throwError(ctx, e);
    }
  },

  async blockComment(
    ctx: StrapiRequestContext
  ): ThrowablePromisedResponse<Comment> {
    const { params = {} } = ctx;
    const { id } = parseParams(params);
    try {
      return await this.getService<IServiceAdmin>().blockComment(id, true);
    } catch (e) {
      throw throwError(ctx, e);
    }
  },

  async unblockComment(
    ctx: StrapiRequestContext
  ): ThrowablePromisedResponse<Comment> {
    const { params = {} } = ctx;
    const { id } = parseParams(params);
    try {
      return await this.getService<IServiceAdmin>().blockComment(id, false);
    } catch (e) {
      throw throwError(ctx, e);
    }
  },

  async blockCommentThread(
    ctx: StrapiRequestContext
  ): ThrowablePromisedResponse<Comment> {
    const { params = {} } = ctx;
    const { id } = parseParams(params);
    try {
      return await this.getService<IServiceAdmin>().blockCommentThread(
        id,
        true
      );
    } catch (e) {
      throw throwError(ctx, e);
    }
  },

  async unblockCommentThread(
    ctx: StrapiRequestContext
  ): ThrowablePromisedResponse<Comment> {
    const { params = {} } = ctx;
    const { id } = parseParams(params);
    try {
      return await this.getService<IServiceAdmin>().blockCommentThread(
        id,
        false
      );
    } catch (e) {
      throw throwError(ctx, e);
    }
  },

  async resolveAbuseReport(
    ctx: StrapiRequestContext
  ): ThrowablePromisedResponse<CommentReport> {
    const { params = {} } = ctx;
    const { id: commentId, reportId } = parseParams(params);
    try {
      return await this.getService<IServiceAdmin>().resolveAbuseReport(
        reportId,
        commentId
      );
    } catch (e) {
      throw throwError(ctx, e);
    }
  },

  async approveComment(
    ctx: StrapiRequestContext
  ): ThrowablePromisedResponse<Comment> {
    const { id } = parseParams(ctx.params || {});
    try {
      return await this.getService<IServiceAdmin>().approveComment(id);
    } catch (e) {
      throw throwError(ctx, e);
    }
  },

  async rejectComment(
    ctx: StrapiRequestContext
  ): ThrowablePromisedResponse<Comment> {
    const { id } = parseParams(ctx.params || {});
    try {
      return await this.getService<IServiceAdmin>().rejectComment(id);
    } catch (e) {
      throw throwError(ctx, e);
    }
  },
};

export default controllers;
