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


const relatedSchema = z.intersection(
  z.object({
    id: z.number(),
    uid: z.string(),
    documentId: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    publishedAt: z.string().nullable(),
  }),
  z.record(z.unknown()),
);

const authorSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
  email: z.string(),
  avatar: z.union([
    z.object({
      url: z.string().nullable(),
      formats: z.object({
        thumbnail: z.object({
          url: z.string(),
        }).nullable(),
      }),
    }),
    z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      url: z.string().nullable(),
      avatar: z.string().nullable(),
    }),
  ]).nullable(),
});

export type Author = z.infer<typeof authorSchema>;
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
const baseCommentSchema = z.object({
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
  reports: z.array(reportSchema).nullable().optional(),
  author: authorSchema,
  gotThread: z.boolean().nullable().optional(),
});

type BaseComment = z.infer<typeof baseCommentSchema>;


const paginationSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  pageCount: z.number(),
  total: z.number(),
});


export type Report = z.infer<typeof reportSchema>;
const commentSchema: z.ZodType<Comment> = baseCommentSchema.extend({
  threadOf: z.lazy(() => commentSchema.nullable().optional()),
});

export type Comment = BaseComment & {
  threadOf?: Comment | null
};


export const commentsSchema = z.object({
  pagination: paginationSchema,
  result: z.array(commentSchema),
});


export const commentDetailsSchema = z.object({
  entity: relatedSchema,
  selected: baseCommentSchema.omit({ related: true }).merge(z.object({ related: z.string(), threadOf: commentSchema.nullable().optional() })).nullable(),
  level: z.array(commentSchema),
});

export type CommentDetails = z.infer<typeof commentDetailsSchema>;


export const contentTypeSchema = z.object({
  data: z.object({
    apiID: z.string(),
    uid: z.string(),
    schema: z.object({
      attributes: z.record(z.any()),
      collectionName: z.string(),
      description: z.string(),
      displayName: z.string(),
      draftAndPublish: z.boolean(),
      kind: z.string(),
      pluralName: z.string(),
      singularName: z.string(),
      visible: z.boolean(),
    }),
  }),
});

export type ContentType = z.infer<typeof contentTypeSchema>;