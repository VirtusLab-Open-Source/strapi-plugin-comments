'use strict';

const { first, isEmpty, isNil, map, uniq, get } = require('lodash');
const { sanitizeEntity } = require('strapi-utils');
const PluginError = require('./utils/error');
const {
    isEqualEntity,
    extractMeta,
    buildNestedStructure,
    checkBadWords,
    filterOurResolvedReports,
    convertContentTypeNameToSlug,
    isValidUserContext,
    resolveUserContextError,
} = require('./utils/functions');

/**
 * comments.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

module.exports = {
    getAssociationModel(ormModel, related) {
        const relatedAssociation = ormModel.associations.find(_ => _.alias === 'related');
        if (relatedAssociation) {
            return relatedAssociation.related.find(rel => rel.collectionName === related);
        }
        return null;
    },

    getMorphModel() {
        const { pluginName, model } = extractMeta(strapi.plugins);
        const ormModel = strapi.query(model.modelName, pluginName);
        return ormModel.model.morph;
    },

    isMongoDB(){
        const { pluginName, model } = extractMeta(strapi.plugins);
        const orm = strapi.query(model.modelName, pluginName).model.orm;
        return orm === 'mongoose';
    },

    getMorphData(query) {
        return this
          .getMorphModel()
          .query(function () {
              this.where(query);
          })
          .fetchAll()
          .then((entities) => entities.map(entity => entity.toJSON()));
    },

    // Find all comments
    async findAll({ related, entity, ...query }) {
        const { pluginName, model } = extractMeta(strapi.plugins);
        const paginationEnabled = !isNil(query._start);
        const ormModel = strapi.query(model.modelName, pluginName);
        let relatedCommentIds = [];
        if (related) {
            const associationModel = this.getAssociationModel(ormModel, related);
            if (associationModel) {
                if (this.isMongoDB()) {
                    const [fieldName] = Object.entries(associationModel.allAttributes).find(([, value]) => value.plugin === 'comments' && value.collection === 'comment') || [];
                    if (!fieldName){
                        throw strapi.errors.badRequest();
                    }
                    const query = { [fieldName]: { $exists: true, $not: { $size: 0 } } };
                    if (entity){
                        query._id = entity;
                    }
                    relatedCommentIds = await associationModel
                      .find(query)
                      .then((entry) => entry.map(_ => _.toJSON()[fieldName]))
                      .then(entry => entry.flatMap(comments => comments.map(comment => comment.id)));
                } else {
                    const morphQuery = entity
                      ? { related_type: related, related_id: entity }
                      : { related_type: related };
                    relatedCommentIds = await this
                      .getMorphData(morphQuery)
                      .then(_ => _.map(entity => entity.comments_id));
                }
            } else {
                throw strapi.errors.badRequest();
            }
        }
        // we not find any content to related data
        if (related && relatedCommentIds.length === 0) {
            return {
                items: [],
                total: 0,
                page: 1,
            };
        }

        const params = {
            ...query,
            _sort: paginationEnabled ? query._sort || 'created_at:desc' : 'created_at:desc',
        };
        if (relatedCommentIds.length) {
            params.id = relatedCommentIds;
        }
        const entities = query && query._q ?
            await ormModel.search(params, ['authorUser', 'related', 'reports']) :
            await ormModel.find(params, ['authorUser', 'related', 'reports']);
        const items = entities.map(_ => filterOurResolvedReports(this.sanitizeCommentEntity(_)));
        const total = paginationEnabled ?
          query && query._q ?
            await ormModel.countSearch(params) :
            await ormModel.count(params) :
          items.length;
        return {
            items,
            total,
            page: paginationEnabled ? query._start / query._limit : undefined,
        };
    },

    // Find comments in the flat structure
    async findAllFlat(relation, query) {
        const { pluginName, model } = extractMeta(strapi.plugins);
        let baseCriteria = {};
        if (relation) {
            baseCriteria = {
                ...baseCriteria,
                relatedSlug: relation,
            };
        }

        let criteria = {
            ...baseCriteria,
            threadOf_null: true,
        };
        if (query) {
            criteria = {
                ...criteria,
                ...query,
            };
        }

        const entitiesRoot = query && query._q ?
            await strapi.query( model.modelName, pluginName)
                .search(criteria, ['authorUser', 'related', 'reports']) :
            await strapi.query( model.modelName, pluginName)
                .find(criteria, ['authorUser', 'related', 'reports']);
        const entitiesNested = await strapi.query( model.modelName, pluginName)
                .find({
                    ...baseCriteria,
                    threadOf_null: false,
                }, ['authorUser', 'related', 'reports']);
        return [...entitiesRoot, ...entitiesNested].map(_ => filterOurResolvedReports(this.sanitizeCommentEntity(_)));
    },

    // Find comments and create relations tree structure
    async findAllInHierarchy (relation, query, startingFromId = null, dropBlockedThreads = false) {
        const entities = await this.findAllFlat(relation, query);
        return buildNestedStructure(entities, startingFromId, 'threadOf', dropBlockedThreads, false, this.isMongoDB());
    },

    // Find single comment
    async findOne(id, relation) {
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
        if (!entity){
            throw strapi.errors.notFound();
        }
        return filterOurResolvedReports(this.sanitizeCommentEntity(entity));
    },

    checkEntityRelation(parsedRelation) {
        const result = parsedRelation.some(ref => {
            const model = strapi.query(ref);
            return model && model.associations.length &&
              model.associations.some(_ => _.plugin === 'comments' && _.collection === 'comment');
        });
        if (!result) {
            throw new PluginError(400, 'Comment not have relation to this type content type.');
        }
    },

    // Create a comment
    async create(data, relation, user = undefined) {
        const { content, related } = data;
        const parsedRelation = related && related instanceof Array ? related : [related];
        this.checkEntityRelation(map(parsedRelation, 'ref'));
        const singleRelationFulfilled = related && (parsedRelation.length === 1);
        const linkToThread = !isNil(data.threadOf) ? !!await this.findOne(data.threadOf, relation) : true;
        const validContext = isValidUserContext(user);

        if (!linkToThread) {
            throw new PluginError(400, 'Thread does not exist');
        }

        if (!validContext) {
            throw resolveUserContextError(user);
        }

        if (checkBadWords(content) && singleRelationFulfilled) {
            const { pluginName, model } = extractMeta(strapi.plugins);
            const relatedEntity = !isEmpty(related) ? first(related) : null;
            const { authorId, authorEmail, authorName, authorUser, ...rest } = data;
            let authorData = {};
            if (validContext && user) {
                authorData = {
                    authorUser: user.id ? user.id : authorUser,
                };
            } else if (authorUser) {
                authorData = {
                    authorUser,
                };
            } else {
                const emailValidation = new RegExp(/\S+@\S+\.\S+/);
                if (authorEmail && !emailValidation.test(authorEmail)) {
                    throw new PluginError(400, 'Author e-mail is not valid value. Key: \'authorEmail\'');
                }

                authorData = {
                    authorId,
                    authorName,
                    authorEmail,
                };
            }

            const relationEntity = await Promise
              .all(parsedRelation.map(rel => strapi.query(rel.ref).findOne({ id: rel.refId })));


            relationEntity.forEach((rel) => {
                if (!rel) {
                    throw new PluginError(404, 'Related entity not found');
                }
            });

            const entity = await strapi.query( model.modelName, pluginName).create({
                ...rest,
                ...authorData,
                relatedSlug: relatedEntity ? `${relatedEntity.ref}:${relatedEntity.refId}` : relation,
                related: parsedRelation
            });
            return this.sanitizeCommentEntity(entity);
        }
        throw new PluginError(400, 'No content received');
    },

    // Update a comment
    async update(id, relation, data, user) {
        const { content } = data;
        const { pluginName, model } = extractMeta(strapi.plugins);
        const existingEntity = await this.findOne(id, relation);
        const validContext = isValidUserContext(user);

        if (!validContext) {
            throw resolveUserContextError(user);
        }

        if (isEqualEntity(existingEntity, data, user) && content) {
            if (checkBadWords(content)) {
                const entity = await strapi.query( model.modelName, pluginName).update(
                    { id },
                    { content }
                );
                return this.sanitizeCommentEntity(entity);
            }
        }
        throw new PluginError(409, 'Action on that entity is not allowed');
    },

    // Points up for comment
    async pointsUp(id, relation, user) {
        if (!isValidUserContext(user)) {
            throw resolveUserContextError(user);
        }

        const { pluginName, model } = extractMeta(strapi.plugins);
        const existingEntity = await this.findOne(id, relation);
        if (existingEntity) {
            const entity = await strapi.query( model.modelName, pluginName).update(
                { id },
                {
                    points: (existingEntity.points || 0) + 1,
                }
            );
            return this.sanitizeCommentEntity(entity);
        }
        throw new PluginError(409, 'Action on that entity is not allowed');
    },

    // Report abuse in comment
    async reportAbuse(id, relation, payload, user) {
        if (!isValidUserContext(user)) {
            throw resolveUserContextError(user);
        }
        const { pluginName, plugin } = extractMeta(strapi.plugins);
        const { report: reportModel } = plugin.models;
        const existingEntity = await this.findOne(id, relation);
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
    async findOneAndThread(id) {
        const { pluginName, model } = extractMeta(strapi.plugins);
        const entity = await strapi.query( model.modelName, pluginName).findOne({ id }, ['threadOf', 'threadOf.reports', 'authorUser', 'related', 'reports']);
        if (!entity){
            throw new PluginError(404, 'Not found');
        }
        const relatedEntity = !isEmpty(entity.related) ? first(entity.related) : null;
        const relation = relatedEntity ? `${convertContentTypeNameToSlug(relatedEntity.__contentType).toLowerCase()}:${relatedEntity.id}` : null;
        const entitiesOnSameLevel = await this.findAllInHierarchy(relation, null, entity.threadOf ? entity.threadOf.id : null)
        const selectedEntity = filterOurResolvedReports(this.sanitizeCommentEntity(entity));
        return {
            selected: {
                ...selectedEntity,
                threadOf: selectedEntity.threadOf ? filterOurResolvedReports(selectedEntity.threadOf) : null,
            },
            level: entitiesOnSameLevel.map(_ => filterOurResolvedReports(_))
        };
    },

    // Block / Unblock a comment
    async blockComment(id) {
        const { pluginName, model } = extractMeta(strapi.plugins);
        const existingEntity = await this.findOne(id);
        const changedEntity = await strapi.query( model.modelName, pluginName).update(
            { id },
            { blocked: !existingEntity.blocked }
        );
        return this.sanitizeCommentEntity(changedEntity);
    },

    // Block / Unblock a comment thread
    async blockCommentThread(id) {
        const { pluginName, model } = extractMeta(strapi.plugins);
        const existingEntity = await this.findOne(id);
        const changedEntity = await strapi.query( model.modelName, pluginName).update(
            { id },
            { blockedThread: !existingEntity.blockedThread }
        );
        await this.blockCommentThreadNested(id, !existingEntity.blockedThread)
        return this.sanitizeCommentEntity(changedEntity);
    },

    async blockCommentThreadNested(id, blockStatus) {
        const { pluginName, model } = extractMeta(strapi.plugins);
        try {
            const entitiesToChange = await strapi.query(model.modelName, pluginName).find({ threadOf: id });
            const changedEntities = await Promise.all(entitiesToChange.map(item => strapi.query(model.modelName, pluginName).update(
                { id: item.id },
                { blockedThread: blockStatus }
            )));
            if (changedEntities) {
                const changedEntitiesList = changedEntities instanceof Array ? changedEntities : [changedEntities];
                const nestedTransactions = await Promise.all(
                    changedEntitiesList.map(item => this.blockCommentThreadNested(item.id, blockStatus))
                );
                return nestedTransactions.length === changedEntitiesList.length;
            }
            return true;
        } catch (e) {
            return false;
        }
    },

    async contentTypeName(contentTypeName) {
        const { pluginName, model } = extractMeta(strapi.plugins);
        const ormModel = strapi.query(model.modelName, pluginName);
        const associationModel = this.getAssociationModel(ormModel, contentTypeName);
        const config = get(strapi.config, ['plugins', 'comments', 'relatedContentTypesFields', contentTypeName], []);
        if (isEmpty(config)) {
            return [];
        }
        if (associationModel) {
            let relatedIds = [];
            let result = [];
            if (this.isMongoDB()) {
                const [fieldName] = Object.entries(associationModel.allAttributes).find(([, value]) => value.plugin === 'comments' && value.collection === 'comment') || [];
                if (!fieldName){
                    throw strapi.errors.badRequest();
                }
                result = await associationModel
                  .find({ [fieldName]: { $exists: true, $not: { $size: 0 } } })
                  .then((entities) => entities.map(_ => _.toJSON()));
            } else {
                relatedIds = await this
                  .getMorphData({ related_type: contentTypeName })
                  .then(_ => uniq(_.map(entity => entity.related_id)));
                result = await strapi.query(associationModel.uid).find({ id: relatedIds });
            }
            const entries = Object.entries(config);
            return result
              .map(_ =>
                entries
                  .reduce((acc, [key, val]) => ({ ...acc, [key]: _[val] }), {}),
              );

        }
        throw strapi.errors.badRequest();
    },

    // Resolve reported abuse for comment
    async resolveAbuseReport(id, commentId) {
        const { pluginName, plugin } = extractMeta(strapi.plugins);
        const { report: reportModel } = plugin.models;
        const entity = await strapi.query(reportModel.modelName, pluginName).update({
            id,
            related: commentId,
        }, {
            resolved: true,
        });
        return entity;
    },

    sanitizeCommentEntity: (entity) => ({
        ...entity,
        authorUser: sanitizeEntity(entity.authorUser, { model: strapi.plugins['users-permissions'].models.user }),
    }),
};
