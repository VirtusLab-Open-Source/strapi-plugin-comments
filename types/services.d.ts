import {
  Id,
  KeyValueSet,
  StrapiPagination,
  StrapiPaginatedResponse,
  StrapiResponseMeta,
  StrapiStore,
  StrapiQueryParams,
  StrapiQueryParamsParsed,
  StrapiQueryParamsParsedFilters,
  StrapiQueryParamsParsedOrderBy,
  StrapiUser,
  OnlyStrings,
  StringMap,
  StrapiRequestQueryFieldsClause,
  PopulateClause,
  StrapiDBBulkActionResponse,
  StrapiAdminUser,
  WhereClause,
} from "strapi-typed";
import { ToBeFixed } from "./common";
import {
  AnyConfig,
  CommentsPluginConfig,
  SettingsCommentsPluginConfig,
  ViewCommentsPluginConfig,
} from "./config";
import { Comment, CommentReport, RelatedEntity } from "./contentTypes";

import PluginError from "../server/utils/error";
import { ContentType, LifeCycleEvent, LifeCycleHookName } from "../server/utils/types";

export type AdminPaginatedResponse<T> = {
  result: Array<T>;
} & StrapiResponseMeta;

export type FindAllFlatProps<T, TFields = keyof T> = {
  query: {
    threadOf?: number | string | null;
    [key: string]: any;
  } & {};
  populate?: PopulateClause<OnlyStrings<TFields>>;
  sort?: StringMap<unknown>;
  fields?: StrapiRequestQueryFieldsClause<OnlyStrings<TFields>>;
  pagination?: StrapiPagination;
  isAdmin?: boolean
};

export type FindAllInHierarchyProps = Omit<FindAllFlatProps, "pagination"> & {
  startingFromId?: Id | null;
  dropBlockedThreads?: boolean;
  isAdmin?: boolean;
};

export type AdminFindAllProps = {
  related?: string;
  entity?: any;
} & StrapiQueryParams;

export type AdminFindAllQueryParamsParsed = {
  _q: string;
  orderBy: StrapiQueryParamsParsedOrderBy;
  pageSize: number;
  page: number;
  filters: StrapiQueryParamsParsedFilters;
} & StrapiQueryParamsParsed;

export type AdminFindOneAndThreadProps = {
  removed?: boolean;
} & StrapiQueryParams;

export type AdminSinglePageResponse = {
  entity: RelatedEntity;
  selected: Comment;
  level: Array<Comment>;
};

export interface IServiceCommon {
  getConfig<T>(path?: string, defaultValue?: any): Promise<T>;
  getPluginStore(): Promise<StrapiStore>;
  getLocalConfig<T>(path?: string, defaultValue?: any): T;
  findAllFlat(
    props: FindAllFlatProps<Comment>,
    relatedEntity?: RelatedEntity | null | boolean
  ): Promise<StrapiPaginatedResponse<Comment>>;
  findAllInHierarchy(
    props: FindAllInHierarchyProps,
    relatedEntity?: RelatedEntity | null | boolean
  ): Promise<Array<Comment>>;
  findOne(criteria: WhereClause): Promise<Comment>;
  findAllPerAuthor(
    props: FindAllFlatProps<Comment>,
    authorId: Id,
    isStrapiAuthor?: boolean
  ): Promise<StrapiPaginatedResponse<Comment>>;
  findRelatedEntitiesFor(entities: Array<Comment>): Promise<RelatedEntity[]>;
  mergeRelatedEntityTo(
    entity: ToBeFixed,
    relatedEntities: Array<RelatedEntity>
  ): Comment;
  modifiedNestedNestedComments(
    id: Id,
    fieldName: string,
    value: any
  ): Promise<boolean>;
  sanitizeCommentEntity(
    entity: Comment,
    blockedAuthorProps: string[],
    populate?: PopulateClause<OnlyStrings<keyof StrapiUser>>,
  ): Comment;
  isValidUserContext(user?: any): boolean;
  parseRelationString(
    relation: string
  ): Promise<[uid: string, relatedId: string | number]>;
  checkBadWords(content: string): Promise<boolean | string | PluginError>;
  isEnabledCollection(uid: string): Promise<boolean>;
  registerLifecycleHook(input: { hookName: LifeCycleHookName, callback: Effect<LifeCycleEvent>, contentTypeName: ContentType }): void;
  runLifecycleHook(input: { hookName: LifeCycleHookName, event: LifeCycleEvent, contentTypeName: ContentType }): Promise<void>;
}

export interface IServiceAdmin {
  getCommonService(): IServiceCommon;
  config<T extends AnyConfig>(viaSettingsPage?: boolean): Promise<T>;
  updateConfig(
    body: SettingsCommentsPluginConfig | undefined,
  ): Promise<SettingsCommentsPluginConfig>;
  restoreConfig(): Promise<SettingsCommentsPluginConfig>;
  restart(): void;
  findAll(props: AdminFindAllProps): Promise<AdminPaginatedResponse<Comment>>;
  findReports(
    props: AdminFindAllProps,
  ): Promise<AdminPaginatedResponse<Comment>>;
  findOneAndThread(
    id: Id,
    props: AdminFindOneAndThreadProps,
  ): Promise<AdminSinglePageResponse>;
  blockComment(id: Id, forceStatus?: boolean): Promise<Comment>;
  deleteComment(id: Id): Promise<Comment>;
  blockCommentThread(id: Id, forceStatus?: boolean): Promise<Comment>;
  approveComment(id: Id): Promise<Comment>;
  rejectComment(id: Id): Promise<Comment>;
  blockNestedThreads(id: Id, blockStatus?: boolean): Promise<boolean>;
  resolveAbuseReport(id: Id, commentId: Id): Promise<CommentReport>;
  resolveCommentMultipleAbuseReports(
    ids: Array<Id>,
    commentId: Id,
  ): Promise<StrapiDBBulkActionResponse>;
  resolveAllAbuseReportsForComment(
    this: IServiceAdmin,
    commentId: Id,
  ): Promise<StrapiDBBulkActionResponse>;
  resolveAllAbuseReportsForThread(
    this: IServiceAdmin,
    commentId: Id,
  ): Promise<StrapiDBBulkActionResponse>;
  resolveMultipleAbuseReports(
    this: IServiceAdmin,
    ids: Array<Id>,
  ): Promise<StrapiDBBulkActionResponse>;
  getDefaultAuthorPopulate():
    | { populate: PopulateClause<"avatar"> }
    | undefined;
  postComment(threadId: Id, body: string, author: StrapiAdminUser): Promise<Comment>;
  updateComment(id: Id, body: string): Promise<Comment>;
}

export interface IServiceClient {
  getCommonService(): IServiceCommon;
  create(
    relation: string,
    data: CreateCommentPayload,
    user?: StrapiUser
  ): Promise<Comment>;
  update(
    id: Id,
    relation: string,
    data: UpdateCommentPayload,
    user?: StrapiUser
  ): Promise<Comment>;
  reportAbuse(
    id: Id,
    relation: string,
    payload: CreateCommentReportPayload,
    user?: StrapiUser
  ): Promise<CommentReport>;
  markAsRemoved(
    id: Id,
    relation: string,
    authorId: Id,
    user?: StrapiUser
  ): Promise<Comment>;
  sendAbuseReportEmail(reason: string, content: string): Promise<void>;
  markAsRemovedNested(id: Id, status: boolean): Promise<boolean>;
  sendResponseNotification(entity: Comment): Promise<void>
}

export interface IServiceGraphQL {
  buildContentTypeFilters(contentType: ToBeFixed);
  graphQLFiltersToStrapiQuery(filters: ToBeFixed, contentType: ToBeFixed = {});
}

export type CommentsPluginServices =
  | IServiceCommon
  | IServiceClient
  | IServiceAdmin;
