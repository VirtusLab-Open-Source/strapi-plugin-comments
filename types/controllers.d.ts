import {
  Id,
  KeyValueSet,
  StrapiPagination,
  StrapiPaginatedResponse,
  StrapiRequestContext,
  StrapiResponseMeta,
  StrapiStore,
  StrapiQueryParams,
  StrapiQueryParamsParsed,
  StrapiQueryParamsParsedFilters,
  StrapiQueryParamsParsedOrderBy,
  StrapiUser,
} from "strapi-typed";
import { ToBeFixed } from "./common";
import {
  CommentsPluginConfig,
  SettingsCommentsPluginConfig,
  ViewCommentsPluginConfig,
} from "./config";
import { Comment, CommentReport, RelatedEntity } from "./contentTypes";

import PluginError from "../server/utils/error";
import {
  AdminFindOneAndThreadProps,
  AdminPaginatedResponse,
  AdminSinglePageResponse,
  CommentsPluginServices,
} from "./services";

export type ThrowableResponse<T> = T | PluginError | never;
export type ThrowablePromisedResponse<T> = Promise<ThrowableResponse<T>>;

export interface IControllerAdmin {
  getService<T extends CommentsPluginServices>(name?: string): T;
  config(
    ctx: StrapiRequestContext
  ): ThrowablePromisedResponse<ViewCommentsPluginConfig>;
  settingsConfig(
    ctx: StrapiRequestContext
  ): ThrowablePromisedResponse<SettingsCommentsPluginConfig>;
  settingsUpdateConfig(
    ctx: StrapiRequestContext
  ): ThrowablePromisedResponse<SettingsCommentsPluginConfig>;
  settingsRestoreConfig(
    ctx: StrapiRequestContext<SettingsCommentsPluginConfig>
  ): ThrowablePromisedResponse<SettingsCommentsPluginConfig>;
  settingsRestart(ctx: StrapiRequestContext): ThrowablePromisedResponse<any>;
  findAll(ctx: StrapiRequestContext): Promise<AdminPaginatedResponse<Comment>>;
  findOne(
    ctx: StrapiRequestContext<unknown, AdminFindOneAndThreadProps>
  ): ThrowablePromisedResponse<AdminSinglePageResponse>;
  blockComment(ctx: StrapiRequestContext): ThrowablePromisedResponse<Comment>;
  unblockComment(ctx: StrapiRequestContext): ThrowablePromisedResponse<Comment>;
  blockCommentThread(
    ctx: StrapiRequestContext
  ): ThrowablePromisedResponse<Comment>;
  unblockCommentThread(
    ctx: StrapiRequestContext
  ): ThrowablePromisedResponse<Comment>;
  resolveAbuseReport(
    ctx: StrapiRequestContext
  ): ThrowablePromisedResponse<CommentReport>;
  approveComment(ctx: StrapiRequestContext): ThrowablePromisedResponse<Comment>;
  rejectComment(ctx: StrapiRequestContext): ThrowablePromisedResponse<Comment>;
}
