'use strict';

const { getPluginService } = require('./../utils/functions');
const { parseParams, throwError } = require('./utils/functions');
const _ = require('lodash');

module.exports = {

  getService(name = 'client') {
    return getPluginService(name);
  },

  async findAllFlat(ctx) {
    const { params = {}, query } = ctx;
    const { relation } = parseParams(params);
    try {
      return this.getService('common')
        .findAllFlat({
          query: {
            ...query,
            $or: [{ removed: { $null: true } }, { removed: false }],
            related: relation,
          },
          populate: {
            threadOf: true,
          },
        });
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
          query: {
            ...query,
            related: relation,
          },
          populate: {
            threadOf: true,
          },
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
    const { params: { relationId, commentId }, query: { authorId } } = ctx;
    if (authorId) {
      try {
        return await this.getService()
          .markAsRemoved(
            relationId,
            commentId,
            authorId,
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
