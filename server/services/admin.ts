import { StrapiContext, Id, StrapiDBQueryArgs, PropType } from "strapi-typed";
import { AdminFindAllProps, AdminFindAllQueryParamsParsed, AdminFindOneAndThreadProps, AdminPaginatedResponse, AdminSinglePageResponse, AnyConfig, Comment, CommentReport, IServiceAdmin, IServiceCommon, PluginConfigKeys, RelatedEntity, SettingsCommentsPluginConfig } from "../../types";

import { getPluginService, parseParams } from './../utils/functions';
import { isEmpty, isNil, isNumber, parseInt } from 'lodash';
import PluginError from './../utils/error';
import {
    getModelUid,
    getRelatedGroups,
    filterOurResolvedReports,
} from './utils/functions';
import { APPROVAL_STATUS, REGEX } from './../utils/constants';

/**
 * Comments Plugin - Moderation services
 */

export = ({ strapi }: StrapiContext): IServiceAdmin => ({

    getCommonService(): IServiceCommon {
        return getPluginService('common');
    },

    // Config
    async config<T extends AnyConfig>(this: IServiceAdmin, viaSettingsPage = false): Promise<T> {
        const pluginStore = await this.getCommonService().getPluginStore();
        const config: SettingsCommentsPluginConfig = await pluginStore.get({ key: 'config' });
        const additionalConfiguration = {
            regex: Object.keys(REGEX).reduce((prev, curr) => ({
                ...prev,
                [curr]: REGEX[curr].toString(),
            }), {}),
        };

        const getConfigProp = <M extends PluginConfigKeys>(key: string) => 
            this.getCommonService().getLocalConfig<PropType<SettingsCommentsPluginConfig, M>>(key);

        const isGQLPluginEnabled: PropType<SettingsCommentsPluginConfig, 'isGQLPluginEnabled'> = !isNil(strapi.plugin('graphql'));

        if (config) {
            return {
                ...config,
                ...additionalConfiguration,
                isGQLPluginEnabled: viaSettingsPage ? isGQLPluginEnabled : undefined,
            } as T;
        }

        const entryLabel = getConfigProp<'entryLabel'>('entryLabel');
        const approvalFlow = getConfigProp<'approvalFlow'>('approvalFlow');
        const reportReasons = getConfigProp<'reportReasons'>('reportReasons');
        const result = {
            entryLabel,
            approvalFlow,
            reportReasons,
            ...additionalConfiguration,
        };

        if (viaSettingsPage) {
            const enabledCollections = getConfigProp<'enabledCollections'>('enabledCollections');
            const moderatorRoles = getConfigProp<'moderatorRoles'>('moderatorRoles');
            return {
                ...result,
                enabledCollections,
                moderatorRoles,
                isGQLPluginEnabled,
            } as T;
        }

        return result as T;
    },

    async updateConfig(this: IServiceAdmin, body: SettingsCommentsPluginConfig): Promise<SettingsCommentsPluginConfig> {
        const pluginStore = await this.getCommonService().getPluginStore();
    
        await pluginStore.set({ key: 'config', value: body });
    
        return this.config<SettingsCommentsPluginConfig>();
      },
    
      async restoreConfig(this: IServiceAdmin): Promise<SettingsCommentsPluginConfig> {
        const pluginStore = await this.getCommonService().getPluginStore();

        await pluginStore.delete({key: 'config'})
    
        return this.config<SettingsCommentsPluginConfig>();
      },

    async restart() {
        setImmediate(() => strapi.reload());
    },

    // Find all comments
    async findAll(this: IServiceAdmin, { related, entity, ...query }: AdminFindAllProps): Promise<AdminPaginatedResponse<Comment>> {
        const { _q, orderBy, pageSize = 10, page = 1, filters }: AdminFindAllQueryParamsParsed = parseParams<AdminFindAllQueryParamsParsed>(query);

        const defaultWhere = {
            $or: [
                { removed: false },
                { removed: null },
            ],
        };

        let params: StrapiDBQueryArgs = {
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
    
        const entities = await strapi.db.query<Comment>(getModelUid('comment'))
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
        const total = await strapi.db.query<number>(getModelUid('comment'))
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
    async findOneAndThread(this: IServiceAdmin, id: Id, { removed, ...query }: AdminFindOneAndThreadProps): Promise<AdminSinglePageResponse> {
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

        const entity = await strapi.db.query<Comment>(getModelUid('comment')).findOne({ 
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
        const relatedEntity = await strapi.db.query<RelatedEntity>(relatedUid).findOne({ 
            where: { id: relatedId }
        }).then((_: RelatedEntity) => ({
            ..._,
            uid: relatedUid,
        }));

        if (!relatedEntity) {
            throw new PluginError(404, 'Relation not found');
        }

        const levelThreadId = (entity?.threadOf as Comment)?.id || null;
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
    async blockComment(this: IServiceAdmin, id: Id, forceStatus?: boolean): Promise<Comment> {
        const existingEntity = await this.getCommonService().findOne({ id });
        const changedEntity = await strapi.db.query<Comment>(getModelUid('comment')).update({ 
            where: { id },
            data: { blocked: !isNil(forceStatus) ? forceStatus : !existingEntity.blocked }
        });
        return this.getCommonService().sanitizeCommentEntity(changedEntity);
    },

    // Block / Unblock a comment thread
    async blockCommentThread(this: IServiceAdmin, id: Id, forceStatus?: boolean): Promise<Comment> {
        const existingEntity = await this.getCommonService().findOne({ id });
        const status = !isNil(forceStatus) ? forceStatus : !existingEntity.blockedThread;
        const changedEntity = await strapi.db.query<Comment>(getModelUid('comment')).update({ 
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
    async approveComment(this: IServiceAdmin, id: Id): Promise<Comment> {
        const changedEntity = await strapi.db.query<Comment>(getModelUid('comment'))
          .update({
              where: { id },
              data: { approvalStatus: APPROVAL_STATUS.APPROVED }
          });
    
        return this.getCommonService().sanitizeCommentEntity(changedEntity);
    },
    
    async rejectComment(this: IServiceAdmin, id: Id): Promise<Comment> {
        const changedEntity = await strapi.db.query<Comment>(getModelUid('comment'))
            .update({ 
                where: { id }, 
                data: { approvalStatus: APPROVAL_STATUS.REJECTED }
            });

        return this.getCommonService().sanitizeCommentEntity(changedEntity);
    },

    async blockNestedThreads(this: IServiceAdmin, id: Id, blockStatus?: boolean): Promise<boolean> {
        return await this.getCommonService()
            .modifiedNestedNestedComments(id, 'blockedThread', blockStatus)
    },

    // Resolve reported abuse for comment
    async resolveAbuseReport(this: IServiceAdmin, id: Id, commentId: Id): Promise<CommentReport> {
        return strapi.db.query<CommentReport>(getModelUid('comment-report')).update({
            where: {
                id,
                related: commentId,
            },
            data: { resolved: true }
        });
    }, 
});
