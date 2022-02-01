'use strict';

const { getPluginService } = require('./../utils/functions');
const { parseParams, throwError } = require('./utils/functions');
const { flatInput } = require('./utils/parsers');

module.exports = {

  getService(name = 'client') {
    return getPluginService(name);
  },

  async findAllFlat(ctx) {
    const { params = {}, query } = ctx;
    const { relation } = parseParams(params);
    try {
      return this.getService('common')
        .findAllFlat(flatInput(relation, query));
    } catch (e) {
      throwError(ctx, e);
    }
  },

  async findAllInHierarchy(ctx) {
    const { params = {}, query } = ctx;
    const { relation } = parseParams(params);
    try {
      return await this.getService('common')
        .findAllInHierarchy({
          ...flatInput(relation, query),
          dropBlockedThreads: true,
        });
    } catch (e) {
      throwError(ctx, e);
    }
  },

  async post(ctx) {
    const { request, params = {}, state = {} } = ctx;
    const { relation } = parseParams(params);
    const { user } = state;
    const { body = {} } = request;
    try {
      const entity = await this.getService()
        .create(relation, body, user);

      if (entity) {
        return entity;
      }
    } catch (e) {
      throwError(ctx, e);
    }
  },

  async put(ctx) {
    const { request, state, params = {} } = ctx;
    const { body = {} } = request;
    const { user } = state;
    const { commentId, relation } = parseParams(params);
    try {
      return await this.getService()
        .update(commentId, relation, body, user);
    } catch (e) {
      throwError(ctx, e);
    }
  },

  async reportAbuse(ctx) {
    const { request, state, params = {} } = ctx;
    const { body = {} } = request;
    if (!body.content) {
      return ctx.badRequest(null, 'Content field is required');
    }
    const { user } = state;
    const { relation, commentId } = parseParams(params);
    try {
      return await this.getService()
        .reportAbuse(commentId, relation, body, user);
    } catch (e) {
      throwError(ctx, e);
    }
  },

  async removeComment(ctx) {
    const { 
      params: { relationId, commentId }, 
      query: { authorId },
      state: { user },
    } = ctx;
    if (authorId || user?.id) {
      try {
        return await this.getService()
          .markAsRemoved(
            commentId,
            relationId,
            authorId,
            user
          );
      } catch (e) {
        if (!e.isBoom) {
          throwError(ctx, e);
        }
        throw e;
      }
    }
    return ctx.badRequest('Not provided authorId');
  },
};
