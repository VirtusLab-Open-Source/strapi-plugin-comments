'use strict';

const { getPluginService, parseParams } = require('./../utils/functions');
const { getAssociationModel } = require('./common');
const { first, isEmpty, isNil, uniq, get } = require('lodash');
const PluginError = require('./../utils/error');
const {
    getModelUid,
    getRelatedGroups,
    filterOurResolvedReports,
    convertContentTypeNameToSlug
} = require('./utils/functions');
const { APPROVAL_STATUS, REGEX } = require('./../utils/constants')

/**
 * Comments Plugin - Moderation services
 */

 module.exports = ({ strapi }) => ({

    getCommonService() {
        return getPluginService('common');
    },

    // Find all comments
    async findAll({ related, entity, ...query }) {
        const { _q, orderBy, pageSize = 10, page = 1, filters, ...rest } = parseParams(query);

        let params = {
            where: !isEmpty(filters) ? {
                ...filters,
            } : undefined,
            offset: (page - 1)*pageSize, 
            limit: pageSize,
            orderBy: orderBy || [{ createdAt: 'desc' }],
        };
        if (_q) {
            params = {
                ...params,
                where: {
                    ...params.where,
                    content: {
                        $contains: _q
                    },
                }
            };
        }
    
        const entities = await strapi.db.query(getModelUid('comment'))
            .findMany(params, ['authorUser', 'reports']);
        const total = await strapi.db.query(getModelUid('comment'))
            .count({
                where: params.where,
            });
        const relatedEntities = await this.getCommonService().findRelatedEntitiesFor(entities);
        const result = entities
            .map(_ => filterOurResolvedReports(this.getCommonService().sanitizeCommentEntity(_)))
            .map(_ => this.getCommonService().mergeRelatedEntityTo(_, relatedEntities));

            console.log(relatedEntities);

        return {
            result,
            pagination: {
                page: page,
                pageSize: pageSize,
                pageCount: Math.floor(total / pageSize) + 1,
                total,
            },
        };
    },

    // Find single comment
    async findOneAndThread(id) {
        const entity = await strapi.db.query(getModelUid('comment')).findOne({ 
            where: {
                id
            },
            populate: ['threadOf', 'threadOf.reports', 'authorUser', 'reports'] 
        });

        if (!entity){
            throw new PluginError(404, 'Not found');
        }

        const [relatedUid, relatedStringId] = getRelatedGroups(entity.related);
        const relatedId = parseInt(relatedStringId, 10);
        const relatedEntity = await strapi.db.query(relatedUid).findOne({ 
            where: { id: relatedId }
        }).then(_ => ({
            ..._,
            uid: relatedUid,
        }));

        if (!relatedEntity) {
            throw new PluginError(404, 'Relation not found');
        }

        const levelThreadId = entity?.threadOf?.id || null;
        const entitiesOnSameLevel = await this.getCommonService()
            .findAllInHierarchy({
                query: {
                    threadOf: levelThreadId,
                    related: entity.related,
                },
                startingFromId: levelThreadId,
                isAdmin: true
            }, false);

        const selectedEntity = filterOurResolvedReports(this.getCommonService().sanitizeCommentEntity(entity));
        
        return {
            entity: relatedEntity,
            selected: {
                ...selectedEntity,
                threadOf: selectedEntity.threadOf ? filterOurResolvedReports(selectedEntity.threadOf) : null,
            },
            level: entitiesOnSameLevel.map(_ => filterOurResolvedReports(_))
        };
    },

    // Block / Unblock a comment
    async blockComment(id, forceStatus) {
        const existingEntity = await this.getCommonService().findOne({ id });
        const changedEntity = await strapi.db.query(getModelUid('comment')).update({ 
            where: { id },
            data: { blocked: !isNil(forceStatus) ? forceStatus : !existingEntity.blocked }
        });
        return this.getCommonService().sanitizeCommentEntity(changedEntity);
    },

    // Block / Unblock a comment thread
    async blockCommentThread(id, forceStatus) {
        const existingEntity = await this.getCommonService().findOne({ id });
        const changedEntity = await strapi.db.query(getModelUid('comment')).update({ 
            where: { id },
            data: { blockedThread: !isNil(forceStatus) ? forceStatus : !existingEntity.blockedThread }
        });
        await this.blockNestedThreads(id, changedEntity.blockedThread);

        return this.getCommonService().sanitizeCommentEntity(changedEntity);
    },

    // Approve comment
    async approveComment(id) {
        const changedEntity = await strapi.db.query(getModelUid('comment'))
          .update({
              where: { id },
              data: { approvalStatus: APPROVAL_STATUS.APPROVED }
          });
    
        return this.getCommonService().sanitizeCommentEntity(changedEntity);
    },
    
    async rejectComment(id) {
        const changedEntity = await strapi.db.query(getModelUid('comment'))
            .update({ 
                where: { id }, 
                data: { approvalStatus: APPROVAL_STATUS.REJECTED }
            });

        return this.getCommonService().sanitizeCommentEntity(changedEntity);
    },

    async blockNestedThreads(id, blockStatus) {
        return await this.getCommonService()
            .modifiedNestedNestedComments(id, 'blockedThread', blockStatus)
    },

    // Resolve reported abuse for comment
    async resolveAbuseReport(id, commentId) {
        return strapi.db.query(getModelUid('comment-report')).update({
            where: {
                id,
                related: commentId,
            },
            data: { resolved: true }
        });
    }, 
});
