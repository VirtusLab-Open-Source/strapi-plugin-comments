import { Database } from '@strapi/database';
import { FindOneParams, Params } from '@strapi/database/dist/entity-manager/types';
import type { Core } from '@strapi/strapi';
import { ContentTypesUUIDs } from '../content-types';


type DatabaseRepository = ReturnType<Database['query']> & {
  findOne: <T>(params: FindOneParams) => Promise<T | null>;
  create: <T>(params: Params) => Promise<T>;
};
export type CoreStrapi = Omit<Core.Strapi, 'query' | 'plugin'> & {
  query: <T extends ContentTypesUUIDs>(query: T) => DatabaseRepository;
  plugin: (pluginName: string) => Omit<Core.Plugin, 'contentTypes'> & {
    contentTypes: Record<string, Core.Plugin['contentTypes'][string] & {
      uid: string
    }>
  }
}

export type StrapiContext = {
  readonly strapi: CoreStrapi;
};

export type Id = number | string;

type CommentApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

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
  rating?: number;
  lastExperience?: string;
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


export type PathTo<T> = T extends object ? {
  [K in keyof T]: T[K] extends object
    ? K extends string
      ? K | `${K}.${PathTo<T[K]>}`
      : never
    : K extends string
      ? K
      : never
}[keyof T] : never;

export type PathValue<T, P extends string> = P extends keyof T
  ? T[P]
  : P extends `${infer K}.${infer R}`
    ? K extends keyof T
      ? PathValue<T[K], R>
      : never
    : never;
