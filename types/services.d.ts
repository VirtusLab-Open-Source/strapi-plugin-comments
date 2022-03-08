import { KeyValueSet, StrapiStore, ToBeFixed } from "./common"
import { CommentsPluginConfig } from "./config"
import { Comment, RelatedEntity } from "./contentTypes";

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
    populate: {
        [key: string]: any
    }
    sort: {
        [key: string]: any
    }
    pagination: Pagination
};

export type FindAllInHierarhyProps = Omit<FindAllFlatProps, 'pagination'> & {
    startingFromId?: number,
    dropBlockedThreads?: boolean,
};

export interface ServiceCommon {
    getConfig<T>(): Promise<T>
    getPluginStore(): Promise<StrapiStore>
    getLocalConfig<T>(): T
    findAllFlat(props: FindAllFlatProps, relatedEntity?: RelatedEntity): Promise<PaginatedResponse>
    findAllInHierarchy(props: FindAllInHierarhyProps, relatedEntity?: RelatedEntity): Promise<Array<Comment>>
    findOne(criteria: KeyValueSet<any>): Promise<Comment>
    findRelatedEntitiesFor(entities: Array<Comment>): Promise<RelatedEntity[]>
    mergeRelatedEntityTo(entity: ToBeFixed, relatedEntities: Array<RelatedEntity>): Comment
    modifiedNestedNestedComments(id: number, fieldName: string, value: any): Promise<boolean> 
    sanitizeCommentEntity(entity: Comment): Comment
    isValidUserContext(user: any): boolean
    parseRelationString(relation: string): Promise<[uid: string, relatedId: string]>
    checkBadWords(content: string): Promise<boolean | string | Error>
}

export type ServiceAdmin = {}

export type ServiceClient = {}