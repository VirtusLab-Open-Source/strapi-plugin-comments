'use strict';

const { parseParams, throwError } = require('./utils/functions');

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


  findAll: async (ctx) => {
    const { params = {} } = ctx;
    const { page } = parseParams(params);
    return await strapi.plugins.comments.services.comments.findAll(ctx.query, page)
  },

  findAllFlat: async (ctx) => {
    const { params = {}, query } = ctx;
    const { relation } = parseParams(params);
    try {
      return await strapi.plugins.comments.services.comments.findAllFlat(relation, query);
    }
    catch (e) {
      throwError(ctx, e);
    }
  },

  findAllInHierarchy: async (ctx) => {
    const { params = {}, query } = ctx;
    const { relation } = parseParams(params);
    try {
      return await strapi.plugins.comments.services.comments.findAllInHierarchy(relation, query, null, true);
    }
    catch (e) {
      throwError(ctx, e);
    }
  },

  post: async (ctx) => {
    const { request, state, params = {} } = ctx;
    const { user } = state;
    const { relation } = parseParams(params);
    const { body = {} }  = request;
    try {
      const entity = await strapi.plugins.comments.services.comments.create(body, relation, user);

      if (entity) {
        return entity;
      }
    }
    catch (e) {
      throwError(ctx, e);
    }
  },

  put: async (ctx) => {
    const { request, state, params = {} } = ctx;
    const { body = {} }  = request;
    const { user } = state;
    const { relation, commentId } = parseParams(params);
    try {
      return await strapi.plugins.comments.services.comments.update(commentId, relation, body, user);
    }
    catch (e) {
      throwError(ctx, e);
    }
  },

  pointsUp: async (ctx) => {
    const { state, params = {} } = ctx;
    const { user } = state;
    const { relation, commentId } = parseParams(params);
    try {
      return await strapi.plugins.comments.services.comments.pointsUp(commentId, relation, user);
    }
    catch (e) {
      throwError(ctx, e);
    }
  },

  reportAbuse: async (ctx) => {
    const { request, state, params = {} } = ctx;
    const { body = {} }  = request;
    if (!body.content){
      return  ctx.badRequest(null, 'Content field is required');
    }
    const { user } = state;
    const { relation, commentId } = parseParams(params);
    try {
      return await strapi.plugins.comments.services.comments.reportAbuse(commentId, relation, body, user);
    }
    catch (e) {
      throwError(ctx, e);
    }
  },

  //
  // Moderation
  //

  findOne: async (ctx) => {
    const { params = {} } = ctx;
    const { id } = parseParams(params);
    try {
      return await strapi.plugins.comments.services.comments.findOneAndThread(id);
    }
    catch (e) {
      throwError(ctx, e);
    }
  },

  blockComment: async (ctx) => {
    const { params = {} } = ctx;
    const { id } = parseParams(params);
    try {
      return await strapi.plugins.comments.services.comments.blockComment(id);
    }
    catch (e) {
      throwError(ctx, e);
    }
  },

  blockCommentThread: async (ctx) => {
    const { params = {} } = ctx;
    const { id } = parseParams(params);
    try {
      return await strapi.plugins.comments.services.comments.blockCommentThread(id);
    }
    catch (e) {
      throwError(ctx, e);
    }
  },

  resolveAbuseReport: async (ctx) => {
    const { params = {} } = ctx;
    const { id, commentId } = parseParams(params);
    try {
      return await strapi.plugins.comments.services.comments.resolveAbuseReport(id, commentId);
    }
    catch (e) {
      throwError(ctx, e);
    }
  },
};
