'use strict';

const BadWordsFilter = require('bad-words');
const { isArray, isNumber, isObject, isNil, isString, first, parseInt, set } = require('lodash');
const { REGEX, CONFIG_PARAMS } = require('../utils/constants');
const PluginError = require('./../utils/error');
const {
    getModelUid,
    getRelatedGroups,
    buildNestedStructure,
    filterOurResolvedReports,
    buildAuthorModel,
    buildConfigQueryProp,
} = require('./utils/functions');

/**
 * Comments Plugin - common services
 */

module.exports = ({ strapi }) => ({

    async getConfig(prop, defaultValue) {
        const queryProp = buildConfigQueryProp(prop);
        const pluginStore = await this.getPluginStore();
        const config = await pluginStore.get({ key: 'config' });

        let result;
        if (config && !useLocal) {
            result = queryProp ? get(config, queryProp) : config;;
        } else {
            result = this.getLocalConfig(queryProp, defaultValue);
        }
        return isNil(result) ? defaultValue : result;
    },

    async getPluginStore() {
        return strapi.store({ type: 'plugin', name: 'comments' });
    },

    getLocalConfig(prop, defaultValue) {
        const queryProp = buildConfigQueryProp(prop);
        const result = strapi.config.get(`plugin.comments${ queryProp ? '.' + queryProp : ''}`);
        return isNil(result) ? defaultValue : result;
    },

    // Find comments in the flat structure
    async findAllFlat({ 
        query = {}, 
        populate = {}, 
        sort, 
        pagination }, relatedEntity = null) {

        const defaultPopulate = {
            authorUser: true,
        };

        let queryExtension = {};

        if (sort && (isString(sort) || isArray(sort))) {
            queryExtension = {
                ...queryExtension,
                orderBy: (isString(sort) ? [sort] : sort)
                .map(_ => REGEX.sorting.test(_) ? _ : `${_}:asc`)
                .reduce((prev, curr) => {
                    const [type = 'asc', ...parts] = curr.split(':').reverse();
                    return { ...set(prev, parts.reverse().join('.'), type) };
                }, {})
            };
        }

        if (pagination && isObject(pagination)) {
            const { page = 1, pageSize = 10 } = pagination;
            queryExtension = {
                ...queryExtension,
                offset: (page - 1) * pageSize,
                limit: pageSize,
            };
        }
        
        const entries = await strapi.db.query(getModelUid('comment'))
        .findMany({
            where: {
                ...query,
            },
            populate: {
                ...defaultPopulate,
                ...populate,
            },
            ...queryExtension,
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
        sort,
        startingFromId = null,
        dropBlockedThreads = false,
    }, relatedEntity) {
        const entities = await this.findAllFlat({ query, populate, sort }, relatedEntity);
        return buildNestedStructure(entities, startingFromId, 'threadOf', dropBlockedThreads, false);
    },

    // Find single comment
    async findOne(criteria) {
        const entity = await strapi.db.query(getModelUid('comment'))
            .findOne({
                where: criteria,
                populate: {
                    reports: true,
                    authorUser: true,
                },
            });
        if (!entity){
            throw new PluginError(404, 'Not found');
        }
        return filterOurResolvedReports(this.sanitizeCommentEntity(entity));
    },

    // Find all related entiries
    async findRelatedEntitiesFor(entities = []) {
        const data = entities.reduce((acc, cur) => {
                const [relatedUid, relatedStringId] = getRelatedGroups(cur.related);
                const parsedRelatedId = parseInt(relatedStringId);
                const relatedId = isNumber(parsedRelatedId) ? parsedRelatedId : relatedStringId;
                return {
                    ...acc,
                    [relatedUid]: [...(acc[relatedUid] || []), relatedId]
                };
            },
            {}
        );
        return Promise.all(
            Object.entries(data)
            .map(async ([relatedUid, relatedStringIds]) => 
                strapi.db.query(relatedUid).findMany({ 
                    where: { id: Array.from(new Set(relatedStringIds)) },
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

    sanitizeCommentEntity(entity) {
        return {
            ...buildAuthorModel({
                ...entity,
                threadOf: isObject(entity.threadOf) ? buildAuthorModel(entity.threadOf) : entity.threadOf,
            }),
        };
    },

    isValidUserContext(user) {
        return user ? !isNil(user?.id) : true;
    },

    async parseRelationString(relation) {
        const [ uid, relatedStringId ] = getRelatedGroups(relation);
        const parsedRelatedId = parseInt(relatedStringId);
        const relatedId = isNumber(parsedRelatedId) ? parsedRelatedId : relatedStringId;

        const enabledCollections = await this.getConfig(CONFIG_PARAMS.ENABLED_COLLECTIONS, []);
        if (!enabledCollections.includes(uid)) {
            throw new PluginError(403, `Action not allowed for collection '${uid}'. Use one of: ${ enabledCollections.join(', ') }`);
        }
        return [ uid, relatedId];
    },

    async checkBadWords(content) {
        const config = await this.getConfig(CONFIG_PARAMS.BAD_WORDS, true);
        if (config) {
            const filter = new BadWordsFilter(isObject(config) ? config : undefined);
            if (content && filter.isProfane(content)) {
                throw new PluginError(400, 'Bad language used! Please polite your comment...', {
                    content: {
                        original: content,
                        filtered: content && filter.clean(content),
                    },
                });
            }
        }
        return content;
    },
});
