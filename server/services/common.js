'use strict';

const { isArray, uniq, first } = require('lodash');
// const { sanitizeEntity } = require('strapi-utils');
const PluginError = require('./../utils/error');
const {
    getModelUid,
    getRelatedGroups,
    buildNestedStructure,
    filterOurResolvedReports
} = require('./utils/functions');

/**
 * Comments Plugin - common services
 */

module.exports = ({ strapi }) => ({

    getConfig(prop, defaultValue) {
        let queryProp = prop;
        if (prop && isArray(prop)) {
            queryProp = prop.join('.');
        }
        return strapi.config.get(`plugin.comments${ queryProp ? '.' + queryProp : ''}`) || defaultValue;
    },

    // Find comments in the flat structure
    async findAllFlat({ query = {}, populate = {} }, relatedEntity = null) {

        const defaultPopulate = {
            authorUser: true,
        };

        const entries = await strapi.db.query(getModelUid('comment'))
        .findMany({
            where: {
                ...query,
            },
            populate: {
                ...defaultPopulate,
                ...populate,
            },
        });

        const entriesWithThreads = await Promise.all(entries.map(async _ => {
            const [nestedEntries, count] = await strapi.db.query(getModelUid('comment'))
                .findWithCount({ 
                    where: {
                        threadOf: _.id
                    }
                 })
            return { id: _.id, itemsInTread: count, firstThreadItemId: first(nestedEntries)?.id }
        }));

        const relatedEntities = relatedEntity !== null ? [relatedEntity] : await this.findRelatedEntitiesFor([...entries]);
        const result = entries
            .map(_ => {
                const threadedItem = entriesWithThreads.find(item => item.id === _.id);
                return this.sanitizeCommentEntity({
                    ..._,
                    threadOf: query.threadOf || _.threadOf || null,
                    gotThread: (threadedItem?.itemsInTread || 0) > 0,
                    threadFirstItemId: threadedItem?.firstThreadItemId,
                });
            });

        if (relatedEntities.filter(_ => _).length > 0) {
            return result.map(_ => this.mergeRelatedEntityTo(_, relatedEntities));
        }
        return result;    
    },

    // Find comments and create relations tree structure
    async findAllInHierarchy ({
        query,
        populate = {},
        startingFromId = null,
        dropBlockedThreads = false,
    }, relatedEntity) {
        const entities = await this.findAllFlat({ query, populate }, relatedEntity);
        return buildNestedStructure(entities, startingFromId, 'threadOf', dropBlockedThreads, false);
    },

    // Find single comment
    async findOne(criteria) {
        const entity = await strapi.db.query(getModelUid('comment'))
            .findOne({
                where: criteria
            }, ['related', 'reports']);
        if (!entity){
            throw new PluginError(404, 'Not found');
        }
        return filterOurResolvedReports(this.sanitizeCommentEntity(entity));
    },

    // Find all related entiries
    async findRelatedEntitiesFor(entities = []) {
        const data = entities.reduce((acc, cur) => {
                const [relatedUid, relatedStringId] = getRelatedGroups(cur.related);
                return {
                    ...acc,
                    [relatedUid]: [...(acc[relatedUid] || []), parseInt(relatedStringId, 10)]
                };
            },
            {}
        );
        return Promise.all(
            Object.entries(data)
            .map(async ([relatedUid, relatedStringIds]) => 
                strapi.db.query(relatedUid).findMany({ 
                    where: { id: Array.from(new Set(relatedStringIds)) } 
                }).then(relatedEntities => relatedEntities.map(_ => 
                    ({
                        ..._,
                        uid: relatedUid,
                    })
                ))
            )
        )
        .then(result => result.flat(2));
    },

    // Merge related entity with comment
    mergeRelatedEntityTo(entity, relatedEntities = []) {
        return {
            ...entity,
            related: relatedEntities.find(relatedEntity => entity.related === `${relatedEntity.uid}:${relatedEntity.id}`)
        };
    },

    async modifiedNestedNestedComments(id, fieldName, value) {
        try {
            const entitiesToChange = await strapi.bd.query(getModelUid('comment'))
                .findMany({
                    where: { threadOf: id }
                });
            const changedEntities = await strapi.bd.query(getModelUid('comment'))
                .updateMany({
                    where: { id: entitiesToChange.map(_ => _.id) },
                    data: { [fieldName]: value }
                });
            if ((entitiesToChange.length === changedEntities.length) && (changedEntities.length > 0)) {
                const nestedTransactions = await Promise.all(
                  changedEntities.map(item => this.modifiedNestedNestedComments(item.id, fieldName, value))
                );
                return nestedTransactions.length === changedEntities.length;
            }
            return true;
        } catch (e) {
            return false;
        }
    },

    sanitizeCommentEntity: (entity) => ({
        ...entity,
	}),

    // sanitizeCommentEntity: (entity) => ({
    //     ...entity,
    //     authorUser: sanitizeEntity(entity.authorUser, { model: strapi.plugins['users-permissions'].models.user }),
	// }),
});
