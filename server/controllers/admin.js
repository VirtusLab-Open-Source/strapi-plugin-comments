'use strict';

const { getPluginService } = require('./../utils/functions');
const { parseParams, throwError } = require('./utils/functions');
const _ = require('lodash');

module.exports = {

  getService(name = 'admin') {
    return getPluginService(name);
  },

  async findAll(ctx) {
    return this.getService()
      .findAll(ctx.query);
  },

  async findOne(ctx) {
    const { params = {} } = ctx;
    const { id } = parseParams(params);
    try {
      return await this.getService()
        .findOneAndThread(id);
    } catch (e) {
      throwError(ctx, e);
    }
  },

  async blockComment(ctx) {
    const { params = {} } = ctx;
    const { id } = parseParams(params);
    try {
      return await this.getService()
        .blockComment(id, true);
    } catch (e) {
      throwError(ctx, e);
    }
  },

  async unblockComment(ctx) {
    const { params = {} } = ctx;
    const { id } = parseParams(params);
    try {
      return await this.getService()
        .blockComment(id, false);
    } catch (e) {
      throwError(ctx, e);
    }
  },

  async blockCommentThread(ctx) {
    const { params = {} } = ctx;
    const { id } = parseParams(params);
    try {
      return await this.getService()
        .blockCommentThread(id, true);
    } catch (e) {
      throwError(ctx, e);
    }
  },

  async unblockCommentThread(ctx) {
    const { params = {} } = ctx;
    const { id } = parseParams(params);
    try {
      return await this.getService()
        .blockCommentThread(id, false);
    } catch (e) {
      throwError(ctx, e);
    }
  },

  async resolveAbuseReport(ctx) {
    const { params = {} } = ctx;
    const { id: commentId, reportId } = parseParams(params);
    try {
      return await this.getService()
        .resolveAbuseReport(reportId, commentId);
    } catch (e) {
      throwError(ctx, e);
    }
  },

  async approveComment(ctx) {
    const { id } = parseParams(ctx.params || {});
    try {
      return await this.getService()
        .approveComment(id);
    } catch (e) {
      throwError(ctx, e);
    }
  },

  async rejectComment(ctx) {
    const { id } = parseParams(ctx.params || {});
    try {
      return await this.getService()
        .rejectComment(id);
    } catch (e) {
      throwError(ctx, e);
    }
  },

  async config() {
    const configRelatedContentTypes = _.get(strapi.config, ['plugins', 'comments', 'relatedContentTypes'], {});
    const contentsTypes = this.getContentsTypes();
    const relatedContentTypes = Object
      .keys(configRelatedContentTypes)
      .reduce((acc, currentKey) => {
          const current = configRelatedContentTypes[currentKey];
          const { key } = contentsTypes.find(content => content.value === currentKey) || {};
          return {
            ...acc,
            [currentKey]: {
              ...current,
              globalName: _.snakeCase(key),
            },
          };
        },
        {},
      );
    return {
      relatedContentTypes,
      contentsTypes,
    };
  },

  getContentsTypes() {
    return Object.entries(strapi.contentTypes)
      .filter(([, contentType]) => (
        contentType.associations || []).some(_ => _.plugin === 'comments' && _.collection === 'comment'),
      )
      .reduce((acc, [, contentType]) => [
          ...acc,
          { key: contentType.globalName, value: contentType.collectionName }],
        [],
      );
  },

  async contentTypeName(ctx) {
    const { params: { contentTypeName } } = ctx;
    try {
      const result = await this.getService()
        .contentTypeName(contentTypeName);
      return { list: result };
    } catch (e) {
      throwError(ctx, e);
    }
  },
};
