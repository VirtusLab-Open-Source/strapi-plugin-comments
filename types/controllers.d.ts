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
  StrapiRequestQueryFieldsClause,
  OnlyStrings,
  StrapiDBBulkActionResponse,
} from "strapi-typed";
import { ToBeFixed } from "./common";
import {
  CommentsPluginConfig,
  SettingsCommentsPluginConfig,
  ViewCommentsPluginConfig,
} from "./config";
import {
  Comment,
  CommentAuthor,
  CommentModelKeys,
  CommentReport,
  RelatedEntity,
} from "./contentTypes";

import PluginError from "../server/utils/error";
import {
  AdminFindOneAndThreadProps,
  AdminPaginatedResponse,
  AdminSinglePageResponse,
  CommentsPluginServices,
} from "./services";

export type FlatInput<TKeys extends string> = {
  relation: Id;
  query: ToBeFixed;
  sort: ToBeFixed;
  pagination?: ToBeFixed;
  fields?: StrapiRequestQueryFieldsClause<TKeys>;
};

export type ThrowableResponse<T> = T | PluginError | never;
export type ThrowablePromisedResponse<T> = Promise<ThrowableResponse<T>>;

export type CreateCommentPayload = {
  content: Comment["content"];
  threadOf: Comment["threadOf"];
  author?: Comment["author"];
  approvalStatus?: Comment["approvalStatus"];
};

export type UpdateCommentPayload = {
  content: Comment["content"];
  author: {
    id: CommentAuthor["id"];
  };
};

export type CreateCommentReportPayload = {
  reason: CommentReport["reason"];
  content: CommentReport["content"];
};

export interface IControllerAdmin {
  getService<T extends CommentsPluginServices>(name?: string): T;
  config(
    ctx: StrapiRequestContext
  ): ThrowablePromisedResponse<ViewCommentsPluginConfig>;
  settingsConfig(
    ctx: StrapiRequestContext
  ): ThrowablePromisedResponse<SettingsCommentsPluginConfig>;
  settingsUpdateConfig(
    ctx: StrapiRequestContext<SettingsCommentsPluginConfig>
  ): ThrowablePromisedResponse<SettingsCommentsPluginConfig>;
  settingsRestoreConfig(
    ctx: StrapiRequestContext<SettingsCommentsPluginConfig>
  ): ThrowablePromisedResponse<SettingsCommentsPluginConfig>;
  settingsRestart(
    ctx: StrapiRequestContext
  ): ThrowablePromisedResponse<unknown>;
  findAll(ctx: StrapiRequestContext): Promise<AdminPaginatedResponse<Comment>>;
  findOne(
    ctx: StrapiRequestContext<never, AdminFindOneAndThreadProps>
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
  resolveMultipleAbuseReports(
    ctx: StrapiRequestContext
  ): ThrowablePromisedResponse<StrapiDBBulkActionResponse>;
  approveComment(ctx: StrapiRequestContext): ThrowablePromisedResponse<Comment>;
  rejectComment(ctx: StrapiRequestContext): ThrowablePromisedResponse<Comment>;
}

export interface IControllerClient {
  getService<T extends CommentsPluginServices>(name?: string): T;
  findAllFlat(
    ctx: StrapiRequestContext<never>
  ): ThrowablePromisedResponse<StrapiPaginatedResponse<Comment>>;
  findAllInHierarchy(
    ctx: StrapiRequestContext<never>
  ): ThrowablePromisedResponse<Array<Comment>>;
  post(
    ctx: StrapiRequestContext<CreateCommentPayload>
  ): ThrowablePromisedResponse<Comment>;
  put(
    ctx: StrapiRequestContext<UpdateCommentPayload>
  ): ThrowablePromisedResponse<Comment>;
  reportAbuse(
    ctx: StrapiRequestContext<CreateCommentReportPayload>
  ): ThrowablePromisedResponse<CommentReport>;
  removeComment(
    ctx: StrapiRequestContext<never>
  ): ThrowablePromisedResponse<Comment>;
}
