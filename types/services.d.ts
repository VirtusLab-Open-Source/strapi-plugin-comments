import { Id, KeyValueSet, StrapiStore, StrapiQueryParamsParsed, StrapiQueryParamsParsedFilters, StrapiQueryParamsParsedOrderBy, StrapiUser } from "strapi-typed"
import { ToBeFixed } from "./common"
import { CommentsPluginConfig, SettingsCommentsPluginConfig, ViewCommentsPluginConfig } from "./config";
import { Comment, CommentReport, RelatedEntity } from "./contentTypes";

import PluginError from "../server/utils/error";


export type Pagination = {
    page?: number
    pageSize?: number
    start?: number
    limit?: number
    withCount?: boolean | string
};

export type ResponseMeta = {
    pagination: Pick<Pagination, 'page' | 'pageSize' |'start' | 'limit'> & { 
        pageCount?: number
        total?: number
    }
};

export type PaginatedResponse<T> = {
    data: Array<T>
    meta?: ResponseMeta
};

export type AdminPaginatedResponse<T> = {
    result: Array<T>
} & ResponseMeta;

export type FindAllFlatProps = {
    query: {
        threadOf?: number | string
        [key: string]: any
    } & {}
    populate?: {
        [key: string]: any
    }
    sort?: {
        [key: string]: any
    }
    pagination?: Pagination
};

export type FindAllInHierarhyProps = Omit<FindAllFlatProps, 'pagination'> & {
    startingFromId?: Id | null
    dropBlockedThreads?: boolean
    isAdmin?: boolean
};

export type AdminFindAllProps = {
    related: string,
    entity: any 
} & StrapiQueryParams;

export type AdminFindAllQueryParamsParsed = {
    _q: string
    orderBy: StrapiQueryParamsParsedOrderBy
    pageSize: number
    page: number
    filters: StrapiQueryParamsParsedFilters
} & StrapiQueryParamsParsed;

export type AdminFindOneAndThreadProps = {
    removed: boolean
} & StrapiQueryParams;

export type AdminSinglePageResponse = {
    entity: RelatedEntity
    selected: Comment
    level: Array<Comment>
};

export interface IServiceCommon {
    getConfig<T>(path?: string, defaultValue?: any): Promise<T>
    getPluginStore(): Promise<StrapiStore>
    getLocalConfig<T>(path?: string, defaultValue?: any): T
    findAllFlat(props: FindAllFlatProps, relatedEntity?: RelatedEntity | null | boolean): Promise<PaginatedResponse<Comment>>
    findAllInHierarchy(props: FindAllInHierarhyProps, relatedEntity?: RelatedEntity | null | boolean): Promise<Array<Comment>>
    findOne(criteria: KeyValueSet<any>): Promise<Comment>
    findRelatedEntitiesFor(entities: Array<Comment>): Promise<RelatedEntity[]>
    mergeRelatedEntityTo(entity: ToBeFixed, relatedEntities: Array<RelatedEntity>): Comment
    modifiedNestedNestedComments(id: Id, fieldName: string, value: any): Promise<boolean> 
    sanitizeCommentEntity(entity: Comment): Comment
    isValidUserContext(user?: any): boolean
    parseRelationString(relation: string): Promise<[uid: string, relatedId: string | number]>
    checkBadWords(content: string): Promise<boolean | string | PluginError>
}

export interface IServiceAdmin {
    getCommonService(): IServiceCommon
    config<T extends AnyConfig>(viaSettingsPage?: boolean): Promise<T | AnyConfig>
    updateConfig(body: SettingsCommentsPluginConfig): Promise<SettingsCommentsPluginConfig>
    restoreConfig(): Promise<SettingsCommentsPluginConfig>
    restart(): void
    findAll(props: AdminFindAllProps): Promise<AdminPaginatedResponse<Comment>>
    findOneAndThread(id: Id, props: AdminFindOneAndThreadProps): Promise<AdminSinglePageResponse>
    blockComment(id: Id, forceStatus?: boolean): Promise<Comment>
    blockCommentThread(id: Id, forceStatus?: boolean): Promise<Comment>
    approveComment(id: Id): Promise<Comment>
    rejectComment(id: Id): Promise<Comment>
    blockNestedThreads(id: Id, blockStatus?: boolean): Promise<boolean>
    resolveAbuseReport(id: Id, commentId: Id): Promise<CommentReport>
}

export interface IServiceClient {
    getCommonService(): IServiceCommon
    create(relation: string, data: ToBeFixed, user: StrapiUser): Promise<Comment>
    update(id: Id, relation: string, data: ToBeFixed, user: StrapiUser): Promise<Comment>
    reportAbuse(id: Id, relation: string, payload:  ToBeFixed, user: StrapiUser): Promise<CommentReport>
    markAsRemoved(id: Id, relation: string, authorId: Id, user: StrapiUser): Promise<Comment>
    sendAbuseReportEmail(reason: string, content: string): Promise<void>
    markAsRemovedNested(id: Id, status: boolean): Promise<boolean>
}

export interface IServiceGraphQL {
    buildContentTypeFilters(contentType: ToBeFixed)
    graphQLFiltersToStrapiQuery(filters: ToBeFixed, contentType: ToBeFixed = {})
}