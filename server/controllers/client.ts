import {
  Comment,
  CommentReport,
  CreateCommentPayload,
  CreateCommentReportPayload,
  IControllerClient,
  Id,
  IServiceClient,
  IServiceCommon,
  ThrowablePromisedResponse,
  ToBeFixed,
  UpdateCommentPayload,
} from "../../types";
import { StrapiRequestContext, StrapiPaginatedResponse } from "strapi-typed";

import {
  assertNotEmpty,
  assertParamsPresent,
  getPluginService,
} from "./../utils/functions";
import { parseParams, throwError } from "./utils/functions";
import { flatInput } from "./utils/parsers";
import PluginError from "../utils/error";
import { AUTHOR_TYPE } from "../utils/constants";

const controllers: IControllerClient = {
  getService(name = "client") {
    return getPluginService(name);
  },

  async findAllFlat(
    this: IControllerClient,
    ctx: StrapiRequestContext<never, ToBeFixed>
  ): ThrowablePromisedResponse<StrapiPaginatedResponse<Comment>> {
    const { params = {}, query, sort, pagination } = ctx;
    const { relation } = parseParams<{ relation: string }>(params);

    const {
      sort: querySort,
      pagination: queryPagination,
      fields,
      ...filterQuery
    } = query || {};

    try {
      assertParamsPresent<{ relation: string }>(params, ["relation"]);

      return this.getService<IServiceCommon>("common").findAllFlat(
        flatInput({
          relation,
          query: filterQuery,
          sort: sort || querySort,
          pagination: pagination || queryPagination,
          fields,
        })
      );
    } catch (e: ToBeFixed) {
      throw throwError(ctx, e);
    }
  },

  async findAllInHierarchy(
    this: IControllerClient,
    ctx: StrapiRequestContext<never, ToBeFixed>
  ): ThrowablePromisedResponse<Array<Comment>> {
    const { params, query, sort } = ctx;
    const { relation } = parseParams<{ relation: string }>(params);

    const { sort: querySort, fields, ...filterQuery } = query || {};

    try {
      assertParamsPresent<{ relation: string }>(params, ["relation"]);

      return await this.getService<IServiceCommon>("common").findAllInHierarchy(
        {
          ...flatInput<Comment>({
            relation,
            query: filterQuery,
            sort: sort || querySort,
            fields,
          }),
          dropBlockedThreads: true,
        }
      );
    } catch (e: ToBeFixed) {
      throw throwError(ctx, e);
    }
  },

  async findAllPerAuthor(
    this: IControllerClient,
    ctx: StrapiRequestContext<never, ToBeFixed>
  ): ThrowablePromisedResponse<StrapiPaginatedResponse<Comment>> {
    const { params = {}, query, sort, pagination } = ctx;
    const { id, type } = parseParams<{ id: Id, type: string }>(params);

    const {
      sort: querySort,
      pagination: queryPagination,
      fields,
      ...filterQuery
    } = query || {};

    try {
      assertParamsPresent<{ id: Id }>(params, ["id"]);

      return this.getService<IServiceCommon>("common").findAllPerAuthor(
        flatInput({
          query: filterQuery,
          sort: sort || querySort,
          pagination: pagination || queryPagination,
          fields,
        }),
        id,
        ![AUTHOR_TYPE.GENERIC.toLowerCase(), AUTHOR_TYPE.GENERIC].includes(type)
      );
    } catch (e: ToBeFixed) {
      throw throwError(ctx, e);
    }
  },

  async post(
    this: IControllerClient,
    ctx: StrapiRequestContext<CreateCommentPayload>
  ): ThrowablePromisedResponse<Comment> {
    const { request, params, state = {} } = ctx;
    const { relation } = parseParams<{
      relation: string;
    }>(params);
    const { user } = state;
    const { body } = request;
    try {
      assertParamsPresent<{ relation: string }>(params, ["relation"]);
      assertNotEmpty<CreateCommentPayload>(body);

      const entity = await this.getService<IServiceClient>().create(
        relation,
        body,
        user
      );

      if (entity) {
        return entity;
      }
      throw new PluginError(400, "Comment hasn't been created");
    } catch (e: ToBeFixed) {
      throw throwError(ctx, e);
    }
  },

  async put(
    this: IControllerClient,
    ctx: StrapiRequestContext<UpdateCommentPayload>
  ): ThrowablePromisedResponse<Comment> {
    const { request, state, params = {} } = ctx;
    const { body } = request;
    const { user } = state;
    const { commentId, relation } = parseParams<{
      relation: string;
      commentId: Id;
    }>(params);
    try {
      assertParamsPresent<{
        relation: string;
        commentId: Id;
      }>(params, ["commentId", "relation"]);
      assertNotEmpty<UpdateCommentPayload>(body);

      return await this.getService<IServiceClient>().update(
        commentId,
        relation,
        body,
        user
      );
    } catch (e: ToBeFixed) {
      throw throwError(ctx, e);
    }
  },

  async reportAbuse(
    this: IControllerClient,
    ctx: StrapiRequestContext<CreateCommentReportPayload>
  ): ThrowablePromisedResponse<CommentReport> {
    const { request, state, params = {} } = ctx;
    const { body } = request;
    const { user } = state;
    const { relation, commentId } = parseParams<{
      relation: string;
      commentId: Id;
    }>(params);

    try {
      assertParamsPresent(params, ["commentId", "relation"]);
      assertNotEmpty<CreateCommentReportPayload>(body);

      if (!body.content) {
        throw new PluginError(400, "Content field is required");
      }
      return await this.getService<IServiceClient>().reportAbuse(
        commentId,
        relation,
        body,
        user
      );
    } catch (e) {
      throw throwError(ctx, e);
    }
  },

  async removeComment(
    this: IControllerClient,
    ctx: StrapiRequestContext<never>
  ): ThrowablePromisedResponse<Comment> {
    const {
      params,
      query,
      state: { user },
    } = ctx;

    const { relation, commentId } = parseParams<{
      relation: string;
      commentId: Id;
    }>(params);
    const { authorId } = parseParams(query);

    try {
      assertParamsPresent<{
        relation: string;
        commentId: Id;
      }>(params, ["commentId", "relation"]);
      assertParamsPresent<{
        authorId: Id;
      }>(query, ["authorId"]);

      if (authorId || user?.id) {
        return await this.getService<IServiceClient>().markAsRemoved(
          commentId,
          relation,
          authorId,
          user
        );
      }
      return new PluginError(400, "Not provided authorId");
    } catch (e: ToBeFixed) {
      if (!e.isBoom) {
        throwError(ctx, e);
      }
      throw e;
    }
  },
};

export default controllers;
