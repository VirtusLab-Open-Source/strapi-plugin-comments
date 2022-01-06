'use strict';

const { isArray, isEmpty, uniq, get, first } = require('lodash');
// const { sanitizeEntity } = require('strapi-utils');
const PluginError = require('./../utils/error');
const {
    extractMeta,
    getModelUid,
    getRelatedGroups,
    buildNestedStructure,
    filterOurResolvedReports
} = require('./utils/functions');

/**
 * Comments Plugin - common services
 */

module.exports = ({ strapi }) => ({
    getAssociationModel(ormModel, related) {
        const relatedAssociation = ormModel.associations.find(_ => _.alias === 'related');
        if (relatedAssociation) {
            return relatedAssociation.related.find(rel => rel.collectionName === related);
        }
        return null;
    },

    getMorphModel() {
        const ormModel = strapi.query(getModelUid('comment'));
        return ormModel.model.morph;
    },

    isMongoDB(){
        return strapi.query(getModelUid('comment'))?.model?.orm === 'mongoose';
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

    checkEntityRelation(uid, entityId) {
        const result = parsedRelation.some(ref => {
            const model = strapi.query(ref);
            return model && model.associations.length &&
              model.associations.some(_ => _.plugin === 'comments' && _.collection === 'comment');
        });
        if (!result) {
            throw new PluginError(400, 'Comment not have relation to this type content type.');
        }
    },

    getConfig(prop) {
        let queryProp = prop;
        if (prop && isArray(prop)) {
            queryProp = prop.join('.');
        }
        return strapi.config.get(`plugin.comments${ queryProp ? '.' + queryProp : ''}`);
    },

    // Find comments in the flat structure
    async findAllFlat(query, isAdmin = false, relatedEntity = null) {
        const criteria = { 
            ...query,
            $or: [{ removed: { $null: true } }, { removed: false }],
        }

        if (isAdmin){
            delete criteria.$or;
        }

        const populate = { authorUser: true, reports: true };

        const entries = await strapi.db.query(getModelUid('comment'))
        .findMany({
            where: {
                ...criteria,
            },
            populate,
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
                return filterOurResolvedReports(this.sanitizeCommentEntity({
                    ..._,
                    threadOf: query.threadOf || _.threadOf || null,
                    gotThread: (threadedItem?.itemsInTread || 0) > 0,
                    threadFirstItemId: threadedItem?.firstThreadItemId,
                }))
            });

        if (relatedEntities.filter(_ => _).length > 0) {
            return result.map(_ => this.mergeRelatedEntityTo(_, relatedEntities));
        }
        return result;    
    },

    // Find comments and create relations tree structure
    async findAllInHierarchy ({
        query,
        startingFromId = null,
        dropBlockedThreads = false,
        isAdmin = false,
    }, relatedEntity) {
        const entities = await this.findAllFlat(query, isAdmin, relatedEntity);
        return buildNestedStructure(entities, startingFromId, 'threadOf', dropBlockedThreads, false);
    },

    // Find single comment
    async findOne(criteria) {
        const entity = await strapi.db.query(getModelUid('comment'))
            .findOne({
                where: criteria
            }, ['related', 'reports']);
        if (!entity){
            throw strapi.errors.notFound();
        }
        return filterOurResolvedReports(this.sanitizeCommentEntity(entity));
    },

    // Find all related entiries
    async findRelatedEntitiesFor(entities = []) {
        return Promise.all(uniq(entities.map(_ => _.related)).map(async _ => {
            const [relatedUid, relatedStringId] = getRelatedGroups(_);
            const relatedId = parseInt(relatedStringId, 10);
            const relatedEntity = await strapi.db.query(relatedUid).findOne({ 
                where: { id: relatedId }
            });
            return {
                ...relatedEntity,
                uid: relatedUid,
            };
        }))
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
