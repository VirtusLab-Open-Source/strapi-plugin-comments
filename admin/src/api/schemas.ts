import { z } from 'zod';
import { COMMENT_STATUS } from '../utils/constants';

export const configSchema = z.object({
  entryLabel: z.record(z.array(z.string())),
  approvalFlow: z.array(z.string()),
  blockedAuthorProps: z.array(z.string()),
  reportReasons: z.object({
    BAD_LANGUAGE: z.literal('BAD_LANGUAGE'),
    DISCRIMINATION: z.literal('DISCRIMINATION'),
    OTHER: z.literal('OTHER'),
  }),
  regex: z.object({
    uid: z.string(),
    relatedUid: z.string(),
    email: z.string(),
    sorting: z.string(),
  }),
  enabledCollections: z.array(z.string()),
  moderatorRoles: z.array(z.string()),
  isGQLPluginEnabled: z.boolean(),
});


export type Config = z.infer<typeof configSchema>;


const relatedSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  title: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string().nullable(),
  uid: z.string(),
});
const authorSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
  email: z.string(),
  avatar: z.null(),
});
const approvalStatusSchema = z.union([
  z.literal(COMMENT_STATUS.PENDING),
  z.literal(COMMENT_STATUS.APPROVED),
  z.literal(COMMENT_STATUS.REJECTED),
  z.literal(COMMENT_STATUS.BLOCKED),
  z.literal(COMMENT_STATUS.OPEN),
  z.literal(COMMENT_STATUS.REMOVED),
  z.literal(COMMENT_STATUS.TO_REVIEW),
  z.literal(COMMENT_STATUS.UNKNOWN),
]);
const threadOfSchema = z.object({
  id: z.number(),
  content: z.string(),
  blocked: z.boolean(),
  blockedThread: z.boolean(),
  blockReason: z.string().nullable(),
  isAdminComment: z.boolean().nullable(),
  removed: z.boolean().nullable(),
  approvalStatus: approvalStatusSchema,
  related: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  author: authorSchema,
});

const paginationSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  pageCount: z.number(),
  total: z.number(),
});
const reportSchema = z.object({
  id: z.number(),
  reason: z.union([
    z.literal('BAD_LANGUAGE'),
    z.literal('DISCRIMINATION'),
    z.literal('OTHER'),
  ]),
  content: z.string(),
  resolved: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});

export type Report = z.infer<typeof reportSchema>;
const commentSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  content: z.string(),
  blocked: z.boolean(),
  blockedThread: z.boolean().nullable(),
  blockReason: z.boolean().nullable(),
  isAdminComment: z.boolean().nullable(),
  removed: z.boolean().nullable(),
  approvalStatus: approvalStatusSchema,
  related: relatedSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  threadOf: threadOfSchema.nullable(),
  reports: z.array(reportSchema),
  author: authorSchema,
  // TODO: refactor this to be a boolean
  gotThread: z.boolean().nullable().default(false),
});

export type Comment = z.infer<typeof commentSchema>;


export const commentsSchema = z.object({
  pagination: paginationSchema,
  result: z.array(commentSchema),
});