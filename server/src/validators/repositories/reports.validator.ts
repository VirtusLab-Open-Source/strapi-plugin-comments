import { z } from 'zod';
import { dbBaseCommentSchema } from './comment.schema';

import { paginationSchema } from './utils';

const relatedSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  content: z.string(),
  blocked: z.boolean(),
  blockedThread: z.boolean(),
  blockReason: z.string().nullable(),
  authorId: z.string(),
  authorName: z.string(),
  authorEmail: z.string(),
  authorAvatar: z.string().nullable(),
  isAdminComment: z.boolean().nullable(),
  removed: z.boolean().nullable(),
  approvalStatus: z.string().nullable(),
  related: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string(),
  locale: z.string().nullable(),
});

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
  related: relatedSchema.nullable(),
});

const findPageSchema = z.object({
  results: z.array(reportSchema),
  pagination: paginationSchema,
});

const updateResultSchema = z.object({
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

export type Report = z.infer<typeof reportSchema>;


const findManySchema = z.array(z.object({
  id: z.number(),
  documentId: z.string().nullable(),
  content: z.string(),
  reason: z.string(),
  resolved: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string().nullable(),
  locale: z.string().nullable(),
  related: dbBaseCommentSchema.nullable(),
}));

export type ReportResultValidator = {
  findMany: z.infer<typeof findManySchema>;
  findPage: z.infer<typeof findPageSchema>;
  update: z.infer<typeof updateResultSchema>
  create: z.infer<typeof reportSchema>;
};

export const reportResultValidator = {
  findMany: findManySchema,
  findPage: findPageSchema,
  update: updateResultSchema,
  create: reportSchema,
};
