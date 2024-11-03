import { z } from 'zod';
import { paginationSchema } from './utils';

const reportSchema = z.object({
  id: z.number(),
  documentId: z.null(),
  content: z.string(),
  reason: z.string(),
  resolved: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.null(),
  locale: z.null(),
});

const reportExternalUserSchema = z.object({
  authorId: z.string().nullable(),
  authorName: z.string().nullable(),
  authorEmail: z.string().email().nullable(),
  authorAvatar: z.string().nullable(),
  authorUser: z.string().optional().nullable(),
});
const baseCommentSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  content: z.string(),
  blocked: z.boolean().nullable(),
  blockedThread: z.boolean().nullable(),
  blockReason: z.string().nullable(),
  isAdminComment: z.string().nullable(),
  removed: z.boolean().nullable(),
  approvalStatus: z.string().nullable(),
  related: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string(),
  locale: z.string().nullable(),
  reports: z.array(reportSchema).default([]),
  gotThread: z.boolean().nullable().optional(),
  threadFirstItemId: z.number().nullable().optional(),
  author: z.any(),
}).merge(reportExternalUserSchema);

const commentSchema = baseCommentSchema.extend({
  threadOf: z.lazy(() => z.union([z.number(), baseCommentSchema])).nullable().optional(),
});

const commentRelatedSchema = z.object({
  id: z.number(),
  uid: z.string(),
  requireCommentsApproval: z.boolean().nullable().optional(),
});

export type CommentRelated = z.infer<typeof commentRelatedSchema>;

const commentWithRelatedSchema = commentSchema.omit({ related: true }).extend({
  related: commentRelatedSchema.nullable().optional(),
});

export type CommentWithRelated = z.infer<typeof commentWithRelatedSchema>;


export const findManySchema = z.array(commentSchema);

export const findWithCountSchema = z.object({
  pagination: paginationSchema,
  results: z.array(commentSchema),
});

export type Comment = z.infer<typeof commentSchema>;

export type CommentResultValidator = {
  findMany: z.infer<typeof findManySchema>;
  findWithCount: z.infer<typeof findWithCountSchema>;
  findOne: z.infer<typeof commentSchema>;
  create: z.infer<typeof commentSchema>;
}

export const commentResultValidator = {
  findMany: findManySchema,
  findWithCount: findWithCountSchema,
  findOne: commentSchema,
  create: commentSchema,
};