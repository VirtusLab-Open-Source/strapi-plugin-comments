'use strict';

const { parseParams, throwError } = require('./utils/functions');
const _ = require('lodash');

/**
 * comments.js controller
 *
 * @description: A set of functions called "actions" of the `comments` plugin.
 */

module.exports = {

  /**
   * Default action.
   *
   * @return {Object}
   */
  async findAll(ctx) {
    const { params = {} } = ctx;
    const { page } = parseParams(params);
    return await strapi.plugins.comments.services.comments.findAll(ctx.query, page);
  },

  async findAllFlat(ctx) {
    const { params = {}, query } = ctx;
    const { relation } = parseParams(params);
    try {
      return await strapi.plugins.comments.services.comments.findAllFlat(relation, query);
    } catch (e) {
      throwError(ctx, e);
    }
  },

  async findAllInHierarchy(ctx) {
    const { params = {}, query } = ctx;
    const { relation } = parseParams(params);
    try {
      return await strapi.plugins.comments.services.comments.findAllInHierarchy(relation, query, null, true);
    } catch (e) {
      throwError(ctx, e);
    }
  },

  async post(ctx) {
    const { request, state, params = {} } = ctx;
    const { user } = state;
    const { relation } = parseParams(params);
    const { body = {} } = request;
    try {
      const entity = await strapi.plugins.comments.services.comments.create(body, relation, user);

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
    const { relation, commentId } = parseParams(params);
    try {
      return await strapi.plugins.comments.services.comments.update(commentId, relation, body, user);
    } catch (e) {
      throwError(ctx, e);
    }
  },

  async pointsUp(ctx) {
    const { state, params = {} } = ctx;
    const { user } = state;
    const { relation, commentId } = parseParams(params);
    try {
      return await strapi.plugins.comments.services.comments.pointsUp(commentId, relation, user);
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
      return await strapi.plugins.comments.services.comments.reportAbuse(commentId, relation, body, user);
    } catch (e) {
      throwError(ctx, e);
    }
  },

  //
  // Moderation
  //

  async findOne(ctx) {
    const { params = {} } = ctx;
    const { id } = parseParams(params);
    try {
      return await strapi.plugins.comments.services.comments.findOneAndThread(id);
    } catch (e) {
      throwError(ctx, e);
    }
  },

  async blockComment(ctx) {
    const { params = {} } = ctx;
    const { id } = parseParams(params);
    try {
      return await strapi.plugins.comments.services.comments.blockComment(id);
    } catch (e) {
      throwError(ctx, e);
    }
  },

  async blockCommentThread(ctx) {
    const { params = {} } = ctx;
    const { id } = parseParams(params);
    try {
      return await strapi.plugins.comments.services.comments.blockCommentThread(id);
    } catch (e) {
      throwError(ctx, e);
    }
  },

  async resolveAbuseReport(ctx) {
    const { params = {} } = ctx;
    const { id, commentId } = parseParams(params);
    try {
      return await strapi.plugins.comments.services.comments.resolveAbuseReport(id, commentId);
    } catch (e) {
      throwError(ctx, e);
    }
  },

  async contentsTypes(ctx) {
    const result = Object.entries(strapi.contentTypes)
      .filter(([, contentType]) => (
        contentType.associations || []).some(_ => _.plugin === 'comments' && _.collection === 'comment'),
      )
      .reduce((acc, [, contentType]) => [
          ...acc,
          { key: contentType.globalName, value: contentType.collectionName }],
        [],
      );
    ctx.body = { list: result };
  },

  async contentTypeName(ctx) {
    const { params: { contentTypeName } } = ctx;
    try {
      const result = await strapi.plugins.comments.services.comments.contentTypeName(contentTypeName);
      ctx.body = { list: result };
    } catch (e) {
      throwError(ctx, e);
    }
  },
};
