import BadWordsFilter from 'bad-words';
import { isArray, isNumber, isObject, isNil, isString, isEmpty, first, parseInt, set, get } from 'lodash';
import { CommentsPluginConfig, Context, FindAllFlatProps, FindAllInHierarhyProps, PaginatedResponse, Pagination, ResponseMeta, ServiceCommon, StrapiStore, ToBeFixed } from '../../types';
import { Comment, RelatedEntity } from '../../types/contentTypes';
import { REGEX, CONFIG_PARAMS } from '../utils/constants';
import PluginError from './../utils/error';
import {
    getModelUid,
    getRelatedGroups,
    buildNestedStructure,
    filterOurResolvedReports,
    buildAuthorModel,
    buildConfigQueryProp,
} from './utils/functions';

/**
 * Comments Plugin - common services
 */

export = ({ strapi }: Context): ServiceCommon => ({

    async getConfig<T>(prop?: string, defaultValue?: any, useLocal: boolean = false): Promise<T> {
        const queryProp: string = buildConfigQueryProp(prop);
        const pluginStore: StrapiStore = await this.getPluginStore();
        const config: CommentsPluginConfig = await pluginStore.get({ key: 'config' });

        let result: T;
        if (config && !useLocal) {
            result = queryProp ? get(config, queryProp, defaultValue) : config;
        } else {
            result = this.getLocalConfig(queryProp, defaultValue);
        }
        return isNil(result) ? defaultValue : result;
    },

    async getPluginStore(): Promise<StrapiStore> {
        return strapi.store({ type: 'plugin', name: 'comments' });
    },

    getLocalConfig<T>(prop?: string, defaultValue?: any): T {
        const queryProp: string = buildConfigQueryProp(prop);
        const result: T = strapi.config.get(`plugin.comments${ queryProp ? '.' + queryProp : ''}`);
        return isNil(result) ? defaultValue : result;
    },

    // Find comments in the flat structure
    async findAllFlat({ 
        query = {}, 
        populate = {}, 
        sort, 
        pagination }: FindAllFlatProps, relatedEntity: RelatedEntity = null): Promise<PaginatedResponse> {

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

        let meta: ResponseMeta = {} as ResponseMeta;
        if (pagination && isObject(pagination)) {
            const parsedPagination: Pagination = Object.keys(pagination)
                .reduce((prev, curr) => ({
                    ...prev,
                    [curr]: parseInt(pagination[curr]),
                }), {});
            const { page = 1, pageSize = 10, start = 0, limit = 10 } = parsedPagination;
            const paginationByPage = !isNil(parsedPagination?.page) || !isNil(parsedPagination?.pageSize);

            queryExtension = {
                ...queryExtension,
                offset: paginationByPage ? (page - 1) * pageSize : start,
                limit: paginationByPage ? pageSize : limit,
            };

            const metaPagination = paginationByPage ? {
                pagination: {
                    page,
                    pageSize,
                },
            } : {
                pagination: {
                    start,
                    limit,
                },
            };

            meta = {
                ...metaPagination,
            };
        }
        
        const entries = await strapi.db.query<Comment>(getModelUid('comment'))
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

        if (pagination?.withCount && (pagination.withCount === 'true' || pagination.withCount === true)) {
            const total = await strapi.db.query<Comment>(getModelUid('comment'))
                .count({
                    where: {
                        ...query,
                    }
                });
            const pageCount = Math.floor(total / meta.pagination.pageSize);
            meta = {
                ...meta,
                pagination: {
                    ...meta.pagination,
                    pageCount: !isNil(meta.pagination.page) ? 
                        total % meta.pagination.pageSize === 0 ? pageCount : pageCount + 1 : 
                        undefined,
                    total,
                },
            };
        }

        const entriesWithThreads = await Promise.all(entries.map(async (_: Comment) => {
            const [nestedEntries, count] = await strapi.db.query<Comment>(getModelUid('comment'))
                .findWithCount({ 
                    where: {
                        threadOf: _.id
                    }
                 })
            return { id: _.id, itemsInTread: count, firstThreadItemId: first<ToBeFixed>(nestedEntries)?.id }
        }));

        const relatedEntities = relatedEntity !== null ? [relatedEntity] : await this.findRelatedEntitiesFor([...entries]);
        const hasRelatedEntitiesToMap = relatedEntities.filter((_: Comment) => _).length > 0;

        const result = entries
            .map((_: Comment) => {
                const threadedItem = entriesWithThreads.find((item: Comment) => item.id === _.id);
                return this.sanitizeCommentEntity({
                    ..._,
                    threadOf: query.threadOf || _.threadOf || null,
                    gotThread: (threadedItem?.itemsInTread || 0) > 0,
                    threadFirstItemId: threadedItem?.firstThreadItemId,
                });
            });

        return {
            data: hasRelatedEntitiesToMap ?
                result.map((_: Comment) => this.mergeRelatedEntityTo(_, relatedEntities)) :
                result,
            ...(isEmpty(meta) ? {} : { meta }),
        };   
    },

    // Find comments and create relations tree structure
    async findAllInHierarchy ({
        query,
        populate = {},
        sort,
        startingFromId = null,
        dropBlockedThreads = false,
    }: FindAllInHierarhyProps, relatedEntity?: RelatedEntity): Promise<Array<Comment>> {
        const entities = await this.findAllFlat({ query, populate, sort }, relatedEntity);
        return buildNestedStructure(entities?.data, startingFromId, 'threadOf', dropBlockedThreads, false);
    },

    // Find single comment
    async findOne(criteria): Promise<Comment> {
        const entity = await strapi.db.query<Comment>(getModelUid('comment'))
            .findOne({
                where: criteria,
                populate: {
                    reports: true,
                    authorUser: true,
                },
            });
        if (!entity){
            throw new PluginError(404, 'Comment does not exist. Check your payload please.');
        }
        return filterOurResolvedReports(this.sanitizeCommentEntity(entity));
    },

    // Find all related entiries
    
    async findRelatedEntitiesFor(entities: Array<Comment> = []): Promise<Array<RelatedEntity>> {
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

        // @ts-ignore
        return Promise.all<RelatedEntity>(
            Object.entries(data)
            .map(async ([relatedUid, relatedStringIds]): Promise<Array<RelatedEntity>> =>
                strapi.db.query<RelatedEntity>(relatedUid).findMany({ 
                    where: { id: Array.from(new Set(relatedStringIds as ToBeFixed)) },
                }).then((relatedEntities: Array<RelatedEntity>) => relatedEntities.map((_: RelatedEntity) => 
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
    mergeRelatedEntityTo(entity: Comment, relatedEntities: Array<RelatedEntity> = []): Comment {
        return {
            ...entity,
            related: relatedEntities.find(relatedEntity => entity.related === `${relatedEntity.uid}:${relatedEntity.id}`)
        };
    },

    async modifiedNestedNestedComments(id, fieldName, value) {
        try {
            const entitiesToChange = await strapi.db.query<Comment>(getModelUid('comment'))
                .findMany({
                    where: { threadOf: id }
                });
            const changedEntities = await strapi.db.query<Comment>(getModelUid('comment'))
                .updateMany({
                    where: { id: entitiesToChange.map((_: Comment) => _.id) },
                    data: { [fieldName]: value }
                });
            if ((entitiesToChange.length === changedEntities.length) && (changedEntities.length > 0)) {
                const nestedTransactions = await Promise.all(
                  changedEntities.map((item: Comment) => this.modifiedNestedNestedComments(item.id, fieldName, value))
                );
                return nestedTransactions.length === changedEntities.length;
            }
            return true;
        } catch (e) {
            return false;
        }
    },

    sanitizeCommentEntity(entity: Comment): Comment {
        return {
            ...buildAuthorModel({
                ...entity,
                threadOf: isObject(entity.threadOf) ? buildAuthorModel(entity.threadOf) : entity.threadOf,
            }),
        };
    },

    isValidUserContext(user?: any): boolean {
        return user ? !isNil(user?.id) : true;
    },

    async parseRelationString(relation): Promise<[uid: string, relatedId: string]> {
        const [ uid, relatedStringId ] = getRelatedGroups(relation);
        const parsedRelatedId = parseInt(relatedStringId);
        const relatedId = isNumber(parsedRelatedId) ? parsedRelatedId : relatedStringId;

        const enabledCollections = await this.getConfig(CONFIG_PARAMS.ENABLED_COLLECTIONS, []);
        if (!enabledCollections.includes(uid)) {
            throw new PluginError(403, `Action not allowed for collection '${uid}'. Use one of: ${ enabledCollections.join(', ') }`);
        }
        return [ uid, relatedId];
    },

    async checkBadWords(content: string): Promise<boolean | string | PluginError> {
        const config = await this.getConfig(CONFIG_PARAMS.BAD_WORDS, true);
        if (config) {
            const filter = new BadWordsFilter(isObject(config) ? config as ToBeFixed : undefined);
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
