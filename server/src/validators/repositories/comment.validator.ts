import { z } from 'zod';
import { dbBaseCommentSchema } from './comment.schema';
import { paginationSchema } from './utils';

const reportSchema = z.object({
  id: z.number(),
  documentId: z.string().nullable(),
  content: z.string(),
  reason: z.string(),
  resolved: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string().nullable(),
  locale: z.string().nullable(),
});

const baseCommentSchema = dbBaseCommentSchema.merge(
  z.object({
    gotThread: z.boolean().nullable().optional(),
    threadFirstItemId: z.number().nullable().optional(),
    reports: z.array(reportSchema).default([]),
    author: z.any().nullable().optional(),
  },
  ),
);

const commentSchema = baseCommentSchema.extend({
  threadOf: z.lazy(() => z.union([z.number(), baseCommentSchema])).nullable().optional(),
});

const commentRelatedSchema = z.object({
  id: z.number(),
  uid: z.string(),
  documentId: z.string(),
  requireCommentsApproval: z.boolean().nullable().optional(),
  locale: z.string().nullable().optional(),
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
