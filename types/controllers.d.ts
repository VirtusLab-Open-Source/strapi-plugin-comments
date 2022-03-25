import { Id, KeyValueSet, StrapiPagination, StrapiPaginatedResponse, StrapiResponseMeta, StrapiStore, StrapiQueryParams, StrapiQueryParamsParsed, StrapiQueryParamsParsedFilters, StrapiQueryParamsParsedOrderBy, StrapiUser } from "strapi-typed"
import { StrapiRequestContext, ToBeFixed } from "./common"
import { CommentsPluginConfig, SettingsCommentsPluginConfig, ViewCommentsPluginConfig } from "./config";
import { Comment, CommentReport, RelatedEntity } from "./contentTypes";

import PluginError from "../server/utils/error";
import { AdminFindOneAndThreadProps, AdminPaginatedResponse, AdminSinglePageResponse, CommentsPluginServices } from "./services";

// export type AdminPaginatedResponse<T> = {
//     result: Array<T>
// } & StrapiResponseMeta;

// export type FindAllFlatProps = {
//     query: {
//         threadOf?: number | string
//         [key: string]: any
//     } & {}
//     populate?: {
//         [key: string]: any
//     }
//     sort?: {
//         [key: string]: any
//     }
//     pagination?: StrapiPagination
// };

// export type FindAllInHierarhyProps = Omit<FindAllFlatProps, 'pagination'> & {
//     startingFromId?: Id | null
//     dropBlockedThreads?: boolean
//     isAdmin?: boolean
// };

// export type AdminFindAllProps = {
//     related: string,
//     entity: any 
// } & StrapiQueryParams;

// export type AdminFindAllQueryParamsParsed = {
//     _q: string
//     orderBy: StrapiQueryParamsParsedOrderBy
//     pageSize: number
//     page: number
//     filters: StrapiQueryParamsParsedFilters
// } & StrapiQueryParamsParsed;

// export type AdminFindOneAndThreadProps = {
//     removed: boolean
// } & StrapiQueryParams;

// export type AdminSinglePageResponse = {
//     entity: RelatedEntity
//     selected: Comment
//     level: Array<Comment>
// };

// export interface IServiceCommon {
//     getConfig<T>(path?: string, defaultValue?: any): Promise<T>
//     getPluginStore(): Promise<StrapiStore>
//     getLocalConfig<T>(path?: string, defaultValue?: any): T
//     findAllFlat(props: FindAllFlatProps, relatedEntity?: RelatedEntity | null | boolean): Promise<StrapiPaginatedResponse<Comment>>
//     findAllInHierarchy(props: FindAllInHierarhyProps, relatedEntity?: RelatedEntity | null | boolean): Promise<Array<Comment>>
//     findOne(criteria: KeyValueSet<any>): Promise<Comment>
//     findRelatedEntitiesFor(entities: Array<Comment>): Promise<RelatedEntity[]>
//     mergeRelatedEntityTo(entity: ToBeFixed, relatedEntities: Array<RelatedEntity>): Comment
//     modifiedNestedNestedComments(id: Id, fieldName: string, value: any): Promise<boolean> 
//     sanitizeCommentEntity(entity: Comment): Comment
//     isValidUserContext(user?: any): boolean
//     parseRelationString(relation: string): Promise<[uid: string, relatedId: string | number]>
//     checkBadWords(content: string): Promise<boolean | string | PluginError>
// }

// export interface IServiceAdmin {
//     getCommonService(): IServiceCommon
//     config<T extends AnyConfig>(viaSettingsPage?: boolean): Promise<T | AnyConfig>
//     updateConfig(body: SettingsCommentsPluginConfig): Promise<SettingsCommentsPluginConfig>
//     restoreConfig(): Promise<SettingsCommentsPluginConfig>
//     restart(): void
//     findAll(props: AdminFindAllProps): Promise<AdminPaginatedResponse<Comment>>
//     findOneAndThread(id: Id, props: AdminFindOneAndThreadProps): Promise<AdminSinglePageResponse>
//     blockComment(id: Id, forceStatus?: boolean): Promise<Comment>
//     blockCommentThread(id: Id, forceStatus?: boolean): Promise<Comment>
//     approveComment(id: Id): Promise<Comment>
//     rejectComment(id: Id): Promise<Comment>
//     blockNestedThreads(id: Id, blockStatus?: boolean): Promise<boolean>
//     resolveAbuseReport(id: Id, commentId: Id): Promise<CommentReport>
// }

// export interface IServiceClient {
//     getCommonService(): IServiceCommon
//     create(relation: string, data: ToBeFixed, user: StrapiUser): Promise<Comment>
//     update(id: Id, relation: string, data: ToBeFixed, user: StrapiUser): Promise<Comment>
//     reportAbuse(id: Id, relation: string, payload:  ToBeFixed, user: StrapiUser): Promise<CommentReport>
//     markAsRemoved(id: Id, relation: string, authorId: Id, user: StrapiUser): Promise<Comment>
//     sendAbuseReportEmail(reason: string, content: string): Promise<void>
//     markAsRemovedNested(id: Id, status: boolean): Promise<boolean>
// }

export type ThrowableResponse<T> = T | PluginError | never
export type ThrowablePromisedResponse<T> = Promise<ThrowableResponse<T>>;
// export interface ThrowablePromisedResponse<T = any> extends Promise<ThrowableResponse<T>> {};

// export type ThrowablePromisedResponse<T extends (...args: any) => any, N = ThrowableResponse> =
// 	T extends (...args: any) => Promise<N<infer U>> ? N<U> :
// 	T extends (...args: any) => N<infer U> ? N<U> :
// 	any

export interface IControllerAdmin {
    getService<T extends CommentsPluginServices>(name?: string): T
    config(ctx: StrapiRequestContext): ThrowablePromisedResponse<ViewCommentsPluginConfig>
    settingsConfig(ctx: StrapiRequestContext): ThrowablePromisedResponse<SettingsCommentsPluginConfig>
    settingsUpdateConfig(ctx: StrapiRequestContext): ThrowablePromisedResponse<SettingsCommentsPluginConfig>
    settingsRestoreConfig(ctx: StrapiRequestContext<SettingsCommentsPluginConfig>): ThrowablePromisedResponse<SettingsCommentsPluginConfig>
    settingsRestart(ctx: StrapiRequestContext): ThrowablePromisedResponse<any>
    findAll(ctx: StrapiRequestContext): Promise<AdminPaginatedResponse<Comment>>
    findOne(ctx: StrapiRequestContext<unknown, AdminFindOneAndThreadProps>): ThrowablePromisedResponse<AdminSinglePageResponse>
    blockComment(ctx: StrapiRequestContext): ThrowablePromisedResponse<Comment>
    unblockComment(ctx: StrapiRequestContext): ThrowablePromisedResponse<Comment>
    blockCommentThread(ctx: StrapiRequestContext): ThrowablePromisedResponse<Comment>
    unblockCommentThread(ctx: StrapiRequestContext): ThrowablePromisedResponse<Comment>
    resolveAbuseReport(ctx: StrapiRequestContext): ThrowablePromisedResponse<CommentReport>
    approveComment(ctx: StrapiRequestContext): ThrowablePromisedResponse<Comment>
    rejectComment(ctx: StrapiRequestContext): ThrowablePromisedResponse<Comment>

}