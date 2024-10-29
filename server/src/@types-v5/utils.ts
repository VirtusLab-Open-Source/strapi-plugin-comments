import { Data, Entity, FindOneParams, Params } from '@strapi/database/dist/entity-manager/types';
import type { CountResult, ID } from '@strapi/database/dist/types';
import type { Core } from '@strapi/strapi';
import { Database } from '@strapi/database';
import { CommentsContentTypes, ContentTypesUUIDs, KeysContentTypes } from '../content-types';

export interface Repository {
  findOne(params?: FindOneParams): Promise<any>;
  findMany(params?: Params): Promise<any[]>;
  findWithCount(params?: Params): Promise<[any[], number]>;
  findPage(params: Params): Promise<{
    results: any[];
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  }>;
  create(params: Params): Promise<any>;
  createMany(params: Params): Promise<CountResult & {
    ids: ID[];
  }>;
  update(params: Params): Promise<any>;
  updateMany(params: Params): Promise<CountResult>;
  delete(params: Params): Promise<any>;
  deleteMany(params?: Params): Promise<CountResult>;
  count(params?: Params): Promise<number>;
  attachRelations(id: ID, data: Data): Promise<any>;
  updateRelations(id: ID, data: Data): Promise<any>;
  deleteRelations(id: ID): Promise<any>;
  populate(entity: Entity, populate: Params['populate']): Promise<any>;
  load(entity: any, field: string | string[], populate?: Params['populate']): Promise<any>;
  loadPages<TField extends string>(entity: any, field: TField | TField[], populate?: Params['populate']): Promise<any>;
}


type DatabaseRepository = ReturnType<Database['query']> & {
  findOne: <T>(params: FindOneParams) => Promise<T | null>;
  create: <T>(params: Params) => Promise<T>;
};
export type CoreStrapi = Omit<Core.Strapi, 'query'> & {
  query: <T extends ContentTypesUUIDs>(query: T) => DatabaseRepository;
}

export type StrapiContext = {
  readonly strapi: CoreStrapi ;
};

export type Id = number | string;

type CommentApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export type Comment<TAuthor = CommentAuthor> = {
  id: Id;
  content: string;
  author?: TAuthor;
  children?: Array<Comment>;
  reports?: Array<CommentReport>;
  threadOf: Comment | number | null;
  gotThread?: boolean;
  related?: any;
  blocked?: boolean;
  blockedThread?: boolean;
  itemsInTread?: number;
  approvalStatus?: CommentApprovalStatus | null;
  firstThreadItemId?: Id;
  threadFirstItemId?: Id;
  isAdminComment?: boolean;
} & CommentAuthorPartial;

export type CommentAuthor = {
  id: Id;
  name?: string;
  email?: string;
  avatar?: string | object;
};

export type CommentAuthorPartial = {
  authorId?: Id;
  authorName?: string;
  authorEmail?: string;
  authorAvatar?: string;
  authorUser?: unknown;
};

export type CommentAuthorResolved<TExtension = Record<string, unknown>> = CommentAuthor & TExtension;

export type CommentReport = {
  id: Id;
  related: Comment | Id;
  reason: any;
  content: string;
  resolved: boolean;
};

export type RelatedEntity = {
  id: Id;
  uid: string;
  requireCommentsApproval?: boolean;
};
export type ToBeFixed = any;