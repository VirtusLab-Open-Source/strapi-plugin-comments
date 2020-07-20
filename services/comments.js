'use strict';

const _ = require('lodash');
const { sanitizeEntity } = require('strapi-utils');
const BadWordsFilter = require('bad-words');
const PluginError = require('./utils/error');

/**
 * comments.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

const isEqualEntity = (existing, data) => {
    const { authorUser, authorId } = existing;
    if (authorUser) {
        return authorUser.id === data.authorUser;
    }
    return authorId === data.authorId;
}

const extractMeta = plugins => {
    const { comments: plugin } = plugins;
    const { comments: service } = plugin.services;
    const { comment: model} = plugin.models;
    return {
        model,
        service,
        plugin,
        pluginName: plugin.package.strapi.name.toLowerCase()
    };
};

const buildNestedStructure = (entities, id = null, field = 'parent', dropBlockedThreads = false, blockNestedThreads = false) =>
    entities
        .filter(entity => (entity[field] === id) || (_.isObject(entity[field]) && (entity[field].id === id)))
        .map(entity => ({ 
            ...entity, 
            [field]: undefined, 
            related: undefined,
            blockedThread: blockNestedThreads || entity.blockedThread,
            children: entity.blockedThread && dropBlockedThreads ? [] : buildNestedStructure(entities, entity.id, field, dropBlockedThreads, entity.blockedThread),
        }));

const checkBadWords = content => {
    const filter = new BadWordsFilter();
    if (content && filter.isProfane(content)) {
        throw new PluginError(400, 'Bad language used! Please polite your comment...', {
            content: {
                original: content,
                filtered: content && filter.clean(content),
            },
        });
    }
    return content;
}

const filterOurResolvedReports = item => (item ? {
    ...item,
    reports: (item.reports || []).filter(report => !report.resolved),
} : item);

module.exports = {
    // Find all comments
    findAll: async (query) => {
        const { pluginName, model } = extractMeta(strapi.plugins);
        const paginationEnabled = !_.isNil(query._start);
        const params = {
            ...query,
            _sort: paginationEnabled ? query._sort || 'created_at:desc' : undefined
        };
        const entities = query._q ? 
            await strapi.query( model.modelName, pluginName).search(params, ['authorUser', 'related', 'reports']) :
            await strapi.query( model.modelName, pluginName).find(params, ['authorUser', 'related', 'reports']);
        const items = entities.map(_ => filterOurResolvedReports(sanitizeEntity(_, { model })));
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

    // Find comments and create relations tree
    findAllInHierarchy: async (relation, startingFromId = null, dropBlockedThreads = false) => {
        const [relationType, relationId] = (relation || '').split(':');
        const { pluginName, model } = extractMeta(strapi.plugins);
        const entities = await strapi.query( model.modelName, pluginName).find({}, ['authorUser', 'related', 'reports'])
            .then(results => relation ? results.filter(result => {
                    const { related } = result || {};
                    if (related && !_.isEmpty(related)) {
                        return _.find(related, item =>
                                (`${item.id}` === relationId) &&
                                (item.__contentType.toLowerCase() === relationType.toLowerCase())
                            );
                    }
                    return false;
                }) : results
            );
        return buildNestedStructure(entities.map(_ => filterOurResolvedReports(sanitizeEntity(_, { model }))), startingFromId, 'threadOf', dropBlockedThreads);
    },

    // Find single comment
    findOne: async (id, relation) => {
        const [relationType, relationId] = (relation || '').split(':');
        const { pluginName, model } = extractMeta(strapi.plugins);
        const entity = await strapi.query( model.modelName, pluginName).findOne({ id }, ['related', 'reports'])
            .then(result => {
                if (relation) {
                    const { related } = result || {};
                    if (related && !_.isEmpty(related)) {
                        if (_.find(related, resultItem => (resultItem.id.toString() === relationId) && (resultItem.__contentType.toLowerCase() === relationType.toLowerCase()))) {
                            return result;
                        }
                        return null;
                    }
                }
                return result;
            });
        return filterOurResolvedReports(sanitizeEntity(entity, { model }));
    },

    // Create a comment
    create: async (data, relation) => {
        const { content, related } = data;
        const { service, model } = extractMeta(strapi.plugins);
        const parsedRelation = related && related instanceof Array ? related : [related];
        const singleRelationFulfilled = related && (parsedRelation.length === 1);
        const linkToThread = data.threadOf ? !!sanitizeEntity(await service.findOne(data.threadOf, relation), { model }) : true;
        
        if (!linkToThread) {
            throw new PluginError(400, 'Thread is not existing');
        }
        
        if (checkBadWords(content) && singleRelationFulfilled) {
            const { pluginName, model } = extractMeta(strapi.plugins);
            const entity = await strapi.query( model.modelName, pluginName).create({
                ...data,
                related: parsedRelation
            });
            return  sanitizeEntity(entity, { model });
        }
        throw new PluginError(400, 'No content received.');
    },

    // Update a comment
    update: async (id, relation, data) => {
        const { content, reports } = data;
        const { pluginName, service, model } = extractMeta(strapi.plugins);
        const existingEntity = sanitizeEntity(await service.findOne(id, relation), { model });
        if (isEqualEntity(existingEntity, data) && content) {
            if (checkBadWords(content)) {
                const entity = await strapi.query( model.modelName, pluginName).update(
                    { id },
                    { content, reports }
                );
                return sanitizeEntity(entity, { model }) ;
            }
        }
        throw new PluginError(409, 'Action on that entity is not allowed');
    },

    // Points up for comment
    pointsUp: async (id, relation) => {
        const { pluginName, service, model } = extractMeta(strapi.plugins);
        const existingEntity = sanitizeEntity(await service.findOne(id, relation), { model });
        if (existingEntity) {
            const entity = await strapi.query( model.modelName, pluginName).update(
                { id },
                {
                    points: (existingEntity.points || 0) + 1,
                }
            );
            return sanitizeEntity(entity, { model }) ;
        }
        throw new PluginError(409, 'Action on that entity is not allowed');
    },

    // Report abuse in comment
    reportAbuse: async (id, relation, payload) => {
        const { pluginName, plugin, model, service  } = extractMeta(strapi.plugins);
        const { report: reportModel } = plugin.models;
        const existingEntity = sanitizeEntity(await service.findOne(id, relation), { model }); 
        if (existingEntity) {
            const entity = await strapi.query(reportModel.modelName, pluginName).create({
                ...payload,
                resolved: false,
                related: id,
            });
            return sanitizeEntity(entity, { model: reportModel }) ;
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
        const entitiesOnSameLevel = await service.findAllInHierarchy(null, entity.threadOf ? entity.threadOf.id : null)
        const selectedEntity = filterOurResolvedReports(sanitizeEntity(entity, { model }));
        return {
            selected: {
                ...selectedEntity,
                threadOf: selectedEntity.threadOf ? filterOurResolvedReports(selectedEntity.threadOf) : null,
            },
            level: entitiesOnSameLevel.map(_ => filterOurResolvedReports(sanitizeEntity(_, { model })))
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
        return sanitizeEntity(changedEntity, { model });
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
        return sanitizeEntity(changedEntity, { model });
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
        return sanitizeEntity(entity, { model: reportModel }) ;
    },
};
