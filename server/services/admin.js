'use strict';

const { getPluginService, parseParams } = require('./../utils/functions');
const { isEmpty, isNil, isNumber, parseInt } = require('lodash');
const PluginError = require('./../utils/error');
const {
    getModelUid,
    getRelatedGroups,
    filterOurResolvedReports,
} = require('./utils/functions');
const { APPROVAL_STATUS, REGEX } = require('./../utils/constants')

/**
 * Comments Plugin - Moderation services
 */

 module.exports = ({ strapi }) => ({

    getCommonService() {
        return getPluginService('common');
    },

    // Config
    async config(viaSettingsPage = false) {
        const pluginStore = await this.getCommonService().getPluginStore();
        const config = await pluginStore.get({ key: 'config' });
        const additionalConfiguration = {
            regex: Object.keys(REGEX).reduce((prev, curr) => ({
                ...prev,
                [curr]: REGEX[curr].toString(),
            }), {}),
        };

        if (config) {
            return {
                ...config,
                ...additionalConfiguration,
            };
        }

        const entryLabel = this.getCommonService().getLocalConfig('entryLabel');
        const approvalFlow = this.getCommonService().getLocalConfig('approvalFlow');
        const result = {
            entryLabel,
            approvalFlow,
            ...additionalConfiguration,
        };

        if (viaSettingsPage) {
            const enabledCollections = this.getCommonService().getLocalConfig('enabledCollections');
            const moderatorRoles = this.getCommonService().getLocalConfig('moderatorRoles');
            return {
                ...result,
                enabledCollections,
                moderatorRoles,
            };
        }

        return result;
    },

    async updateConfig(body) {
        const pluginStore = await this.getCommonService().getPluginStore();
    
        await pluginStore.set({ key: 'config', value: body });
    
        return this.config();
      },
    
      async restoreConfig() {
        const pluginStore = await this.getCommonService().getPluginStore();
        const defaultConfig = this.getCommonService().getLocalConfig();
    
        await pluginStore.delete({key: 'config'})
        await pluginStore.set({
            key: 'config',
            value: {
                ...defaultConfig,
            }
        });
    
        return this.config();
      },

    // Find all comments
    async findAll({ related, entity, ...query }) {
        const { _q, orderBy, pageSize = 10, page = 1, filters, ...rest } = parseParams(query);

        const defaultWhere = {
            $or: [
                { removed: false },
                { removed: null },
            ],
        };

        let params = {
            where: !isEmpty(filters) ? {
                ...defaultWhere,
                ...filters,
            } : { ...defaultWhere },
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
            .findMany({
                ...params, 
                populate: {
                    authorUser: true,
                    threadOf: true,
                    reports: {
                        where: { 
                            resolved: false
                        },
                    },
                },
            });
        const total = await strapi.db.query(getModelUid('comment'))
            .count({
                where: params.where,
            });
        const relatedEntities = await this.getCommonService().findRelatedEntitiesFor(entities);
        const result = entities
            .map(_ => filterOurResolvedReports(this.getCommonService().sanitizeCommentEntity(_)))
            .map(_ => this.getCommonService().mergeRelatedEntityTo(_, relatedEntities));

        const pageCount = Math.floor(total / pageSize);
        return {
            result,
            pagination: {
                page: page,
                pageSize: pageSize,
                pageCount: total % pageSize === 0 ? pageCount : pageCount + 1,
                total,
            },
        };
    },

    // Find single comment
    async findOneAndThread(id, { removed, ...query }) {
        const defaultWhere = !removed ? {
            $or: [
                { removed: false },
                { removed: null },
            ],
        } : {};
        
        const reportsPopulation = {
            reports: {
                where: { 
                    resolved: false,
                },
            }
        };

        const defaultPopulate = {
            populate: {
                authorUser: true,
                threadOf: {
                    populate: { 
                        authorUser: true,
                        ...reportsPopulation
                    },
                },
                ...reportsPopulation,
            },
        }

        const entity = await strapi.db.query(getModelUid('comment')).findOne({ 
            where: {
                id,
            },
            ...defaultPopulate,
        });

        if (!entity){
            throw new PluginError(404, 'Not found');
        }

        const [relatedUid, relatedStringId] = getRelatedGroups(entity.related);
        const parsedRelatedId = parseInt(relatedStringId);
        const relatedId = isNumber(parsedRelatedId) ? parsedRelatedId : relatedStringId;
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
                    ...defaultWhere,
                    ...query,
                    threadOf: levelThreadId,
                    related: entity.related,
                },
                ...defaultPopulate,
                startingFromId: levelThreadId,
                isAdmin: true
            }, false);
        const selectedEntity = this.getCommonService().sanitizeCommentEntity({
            ...entity,
            threadOf: entity.threadOf || null,
        });
        
        return {
            entity: relatedEntity,
            selected: selectedEntity,
            level: entitiesOnSameLevel,
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
        const status = !isNil(forceStatus) ? forceStatus : !existingEntity.blockedThread;
        const changedEntity = await strapi.db.query(getModelUid('comment')).update({ 
            where: { id },
            data: { 
                blocked: status,
                blockedThread: status,
            },
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
