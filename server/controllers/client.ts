import { ToBeFixed } from "../../types";

import { getPluginService } from "./../utils/functions";
import { parseParams, throwError } from "./utils/functions";
import { flatInput } from "./utils/parsers";

const controllers: ToBeFixed = {
  getService(name = "client") {
    return getPluginService(name);
  },

  async findAllFlat(ctx: ToBeFixed) {
    const { params = {}, query, sort, pagination } = ctx;
    const { relation } = parseParams(params);

    const {
      sort: querySort,
      pagination: queryPagination,
      ...filterQuery
    } = query || {};

    try {
      return this.getService("common").findAllFlat(
        flatInput(
          relation,
          filterQuery,
          sort || querySort,
          pagination || queryPagination
        )
      );
    } catch (e) {
      throwError(ctx, e);
    }
  },

  async findAllInHierarchy(ctx: ToBeFixed) {
    const { params = {}, query, sort } = ctx;
    const { relation } = parseParams(params);

    const { sort: querySort, ...filterQuery } = query || {};

    try {
      return await this.getService("common").findAllInHierarchy({
        ...flatInput(relation, filterQuery, sort || querySort),
        dropBlockedThreads: true,
      });
    } catch (e) {
      throwError(ctx, e);
    }
  },

  async post(ctx: ToBeFixed) {
    const { request, params = {}, state = {} } = ctx;
    const { relation } = parseParams(params);
    const { user } = state;
    const { body = {} } = request;
    try {
      const entity = await this.getService().create(relation, body, user);

      if (entity) {
        return entity;
      }
    } catch (e) {
      throwError(ctx, e);
    }
  },

  async put(ctx: ToBeFixed) {
    const { request, state, params = {} } = ctx;
    const { body = {} } = request;
    const { user } = state;
    const { commentId, relation } = parseParams(params);
    try {
      return await this.getService().update(commentId, relation, body, user);
    } catch (e) {
      throwError(ctx, e);
    }
  },

  async reportAbuse(ctx: ToBeFixed) {
    const { request, state, params = {} } = ctx;
    const { body = {} } = request;
    if (!body.content) {
      return ctx.badRequest(null, "Content field is required");
    }
    const { user } = state;
    const { relation, commentId } = parseParams(params);
    try {
      return await this.getService().reportAbuse(
        commentId,
        relation,
        body,
        user
      );
    } catch (e) {
      throwError(ctx, e);
    }
  },

  async removeComment(ctx: ToBeFixed) {
    const {
      params: { relationId, commentId },
      query: { authorId },
      state: { user },
    } = ctx;
    if (authorId || user?.id) {
      try {
        return await this.getService().markAsRemoved(
          commentId,
          relationId,
          authorId,
          user
        );
      } catch (e: ToBeFixed) {
        if (!e.isBoom) {
          throwError(ctx, e);
        }
        throw e;
      }
    }
    return ctx.badRequest("Not provided authorId");
  },
};

export default controllers;