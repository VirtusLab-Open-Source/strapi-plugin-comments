'use strict';

const { first, isEmpty, isNil } = require('lodash');
const PluginError = require('./utils/error');
const { isEqualEntity, extractMeta, buildNestedStructure, checkBadWords, filterOurResolvedReports, convertContentTypeNameToSlug } = require('./utils/functions');

/**
 * comments.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

module.exports = {

    // Find all comments
    findAll: async (query) => {
        const { pluginName, model } = extractMeta(strapi.plugins);
        const paginationEnabled = !isNil(query._start);
        const params = {
            ...query,
            _sort: paginationEnabled ? query._sort || 'created_at:desc' : undefined
        };
        const entities = query._q ? 
            await strapi.query( model.modelName, pluginName).search(params, ['authorUser', 'related', 'reports']) :
            await strapi.query( model.modelName, pluginName).find(params, ['authorUser', 'related', 'reports']);
        const items = entities.map(_ => filterOurResolvedReports(_));
        const total = paginationEnabled ?
            query._q ?
                await strapi.query( model.modelName, pluginName).countSearch(params) : 
                await strapi.query( model.modelName, pluginName).count(params) :
            items.length;
        return {
            items,
            total,
            page: paginationEnabled ? query._start/query._limit : undefined,
        };
    },

    // Find comments in the flat structure
    findAllFlat: async (relation) => {
        const { pluginName, model } = extractMeta(strapi.plugins);
        let criteria = {};
        if (relation) {
            criteria = {
                ...criteria,
                relatedSlug: relation,
            };
        }
        const entities = await strapi.query( model.modelName, pluginName)
            .find(criteria, ['authorUser', 'related', 'reports']);
        return entities.map(_ => filterOurResolvedReports(_));
    },

    // Find comments and create relations tree structure
    findAllInHierarchy: async (relation, startingFromId = null, dropBlockedThreads = false) => {
        const { service } = extractMeta(strapi.plugins);
        const entities = await service.findAllFlat(relation);
        return buildNestedStructure(entities, startingFromId, 'threadOf', dropBlockedThreads);
    },

    // Find single comment
    findOne: async (id, relation) => {
        const { pluginName, model } = extractMeta(strapi.plugins);
        let criteria = { id };
        if (relation) {
            criteria = {
                ...criteria,
                relatedSlug: relation,
            };
        }
        const entity = await strapi.query( model.modelName, pluginName)
            .findOne(criteria, ['related', 'reports']);
        return filterOurResolvedReports(entity);
    },

    // Create a comment
    create: async (data, relation) => {
        const { content, related } = data;
        const { service, model } = extractMeta(strapi.plugins);
        const parsedRelation = related && related instanceof Array ? related : [related];
        const singleRelationFulfilled = related && (parsedRelation.length === 1);
        const linkToThread = data.threadOf ? !!await service.findOne(data.threadOf, relation) : true;
        
        if (!linkToThread) {
            throw new PluginError(400, 'Thread is not existing');
        }
        
        if (checkBadWords(content) && singleRelationFulfilled) {
            const { pluginName, model } = extractMeta(strapi.plugins);
            const relatedEntity = !isEmpty(related) ? first(related) : null;
            const entity = await strapi.query( model.modelName, pluginName).create({
                ...data,
                relatedSlug: relatedEntity ? `${relatedEntity.ref}:${relatedEntity.refId}` : relation,
                related: parsedRelation
            });
            return entity;
        }
        throw new PluginError(400, 'No content received.');
    },

    // Update a comment
    update: async (id, relation, data) => {
        const { content } = data;
        const { pluginName, service, model } = extractMeta(strapi.plugins);
        const existingEntity = await service.findOne(id, relation);
        if (isEqualEntity(existingEntity, data) && content) {
            if (checkBadWords(content)) {
                const entity = await strapi.query( model.modelName, pluginName).update(
                    { id },
                    { content }
                );
                return entity;
            }
        }
        throw new PluginError(409, 'Action on that entity is not allowed');
    },

    // Points up for comment
    pointsUp: async (id, relation) => {
        const { pluginName, service, model } = extractMeta(strapi.plugins);
        const existingEntity = await service.findOne(id, relation);
        if (existingEntity) {
            const entity = await strapi.query( model.modelName, pluginName).update(
                { id },
                {
                    points: (existingEntity.points || 0) + 1,
                }
            );
            return entity;
        }
        throw new PluginError(409, 'Action on that entity is not allowed');
    },

    // Report abuse in comment
    reportAbuse: async (id, relation, payload) => {
        const { pluginName, plugin, model, service  } = extractMeta(strapi.plugins);
        const { report: reportModel } = plugin.models;
        const existingEntity = await service.findOne(id, relation); 
        if (existingEntity) {
            const entity = await strapi.query(reportModel.modelName, pluginName).create({
                ...payload,
                resolved: false,
                related: id,
            });
            return entity;
        }
        throw new PluginError(409, 'Action on that entity is not allowed');
    },

    //
    // Moderation
    //

    // Find single comment
    findOneAndThread: async (id) => {
        const { pluginName, service, model } = extractMeta(strapi.plugins);
        const entity = await strapi.query( model.modelName, pluginName).findOne({ id }, ['threadOf', 'threadOf.reports', 'authorUser', 'related', 'reports']);
        const relatedEntity = !isEmpty(entity.related) ? first(entity.related) : null;
        const relation = relatedEntity ? `${convertContentTypeNameToSlug(relatedEntity.__contentType).toLowerCase()}:${relatedEntity.id}` : null;
        const entitiesOnSameLevel = await service.findAllInHierarchy(relation, entity.threadOf ? entity.threadOf.id : null)
        const selectedEntity = filterOurResolvedReports(entity);
        return {
            selected: {
                ...selectedEntity,
                threadOf: selectedEntity.threadOf ? filterOurResolvedReports(selectedEntity.threadOf) : null,
            },
            level: entitiesOnSameLevel.map(_ => filterOurResolvedReports(_))
        };
    },

    // Block / Unblock a comment
    blockComment: async (id) => {
        const { pluginName, service, model } = extractMeta(strapi.plugins);
        const existingEntity = await service.findOne(id);
        const changedEntity = await strapi.query( model.modelName, pluginName).update(
            { id },
            { blocked: !existingEntity.blocked }
        );
        return changedEntity;
    },

    // Block / Unblock a comment thread
    blockCommentThread: async (id) => {
        const { pluginName, service, model } = extractMeta(strapi.plugins);
        const existingEntity = await service.findOne(id);
        const changedEntity = await strapi.query( model.modelName, pluginName).update(
            { id },
            { blockedThread: !existingEntity.blockedThread }
        );
        await service.blockCommentThreadNested(id, !existingEntity.blockedThread)
        return changedEntity;
    },

    blockCommentThreadNested: async (id, blockStatus) => {
        const { pluginName, service, model } = extractMeta(strapi.plugins);
        try {
            const entitiesToChange = await strapi.query(model.modelName, pluginName).find({ threadOf: id });
            const changedEntities = await Promise.all(entitiesToChange.map(item => strapi.query(model.modelName, pluginName).update(
                { id: item.id },
                { blockedThread: blockStatus }
            )));
            if (changedEntities) {
                const changedEntitiesList = changedEntities instanceof Array ? changedEntities : [changedEntities];
                const nestedTransactions = await Promise.all(
                    changedEntitiesList.map(item => service.blockCommentThreadNested(item.id, blockStatus))
                );
                return nestedTransactions.length === changedEntitiesList.length;
            }
            return true;    
        } catch (e) {
            return false;
        }
    },

    // Resolve reported abuse for comment
    resolveAbuseReport: async (id, commentId) => {
        const { pluginName, plugin  } = extractMeta(strapi.plugins);
        const { report: reportModel } = plugin.models;
        const entity = await strapi.query(reportModel.modelName, pluginName).update({
            id,
            related: commentId,
        }, {
            resolved: true,
        });
        return entity;
    },
};
