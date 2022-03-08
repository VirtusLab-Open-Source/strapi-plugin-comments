import PluginError from "../server/utils/error";
import { KeyValueSet, StrapiStore, StrapiUser, ToBeFixed } from "./common"
import { Comment, CommentReport, Id, RelatedEntity } from "./contentTypes";

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

export type PaginatedResponse = {
    data: Array<Comment>
    meta?: ResponseMeta
};

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
    startingFromId?: number | null,
    dropBlockedThreads?: boolean,
};

export interface ServiceCommon {
    getConfig<T>(path?: string, defaultValue?: any): Promise<T>
    getPluginStore(): Promise<StrapiStore>
    getLocalConfig<T>(path?: string, defaultValue?: any): T
    findAllFlat(props: FindAllFlatProps, relatedEntity?: RelatedEntity): Promise<PaginatedResponse>
    findAllInHierarchy(props: FindAllInHierarhyProps, relatedEntity?: RelatedEntity): Promise<Array<Comment>>
    findOne(criteria: KeyValueSet<any>): Promise<Comment>
    findRelatedEntitiesFor(entities: Array<Comment>): Promise<RelatedEntity[]>
    mergeRelatedEntityTo(entity: ToBeFixed, relatedEntities: Array<RelatedEntity>): Comment
    modifiedNestedNestedComments(id: Id, fieldName: string, value: any): Promise<boolean> 
    sanitizeCommentEntity(entity: Comment): Comment
    isValidUserContext(user?: any): boolean
    parseRelationString(relation: string): Promise<[uid: string, relatedId: string]>
    checkBadWords(content: string): Promise<boolean | string | PluginError>
}

export type ServiceAdmin = {}

export interface ServiceClient {
    getCommonService(): ServiceCommon
    create(relation: string, data: ToBeFixed, user: StrapiUser): Promise<Comment>
    update(id: Id, relation: string, data: ToBeFixed, user: StrapiUser): Promise<Comment>
    reportAbuse(id: Id, relation: string, payload:  ToBeFixed, user: StrapiUser): Promise<CommentReport>
    markAsRemoved(id: Id, relation: string, authorId: Id, user: StrapiUser): Promise<Comment>
    sendAbuseReportEmail(reason: string, content: string): Promise<void>
    markAsRemovedNested(id: Id, status: boolean): Promise<boolean>
}