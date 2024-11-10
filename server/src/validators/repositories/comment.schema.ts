import { z } from 'zod';

export const dbBaseCommentSchema = z.object({
  id: z.number(),
  documentId: z.string().nullable(),
  content: z.string(),
  blocked: z.boolean().nullable(),
  blockedThread: z.boolean().nullable(),
  blockReason: z.string().nullable(),
  isAdminComment: z.boolean().nullable(),
  removed: z.boolean().nullable(),
  approvalStatus: z.string().nullable(),
  related: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
  publishedAt: z.string().nullable(),
  authorId: z.string().nullable(),
  authorName: z.string().nullable(),
  authorEmail: z.string().email().nullable(),
  authorAvatar: z.string().nullable(),
  authorUser: z.string().optional().nullable(),
  locale: z.string().nullable(),
});
