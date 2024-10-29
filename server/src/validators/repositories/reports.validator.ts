import { z } from 'zod';

import { paginationSchema } from './utils';

const relatedSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  content: z.string(),
  blocked: z.boolean(),
  blockedThread: z.boolean(),
  blockReason: z.null(),
  authorId: z.string(),
  authorName: z.string(),
  authorEmail: z.string(),
  authorAvatar: z.null(),
  isAdminComment: z.null(),
  removed: z.null(),
  approvalStatus: z.null(),
  related: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string(),
  locale: z.null(),
});

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
  related: relatedSchema,
});

const findPageSchema = z.object({
  results: z.array(reportSchema),
  pagination: paginationSchema,
});

const updateResultSchema = z.object({
  id: z.number(),
  documentId: z.null(),
  content: z.string(),
  reason: z.string(),
  resolved: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.null(),
  locale: z.null()
})

export type Report = z.infer<typeof reportSchema>;

export type ReportResultValidator = {
  findPage: z.infer<typeof findPageSchema>;
  update: z.infer<typeof updateResultSchema>
};

export const reportResultValidator = {
  findPage: findPageSchema,
  update: updateResultSchema
}