import { z } from 'zod';

const fileInfoSchema = z.object({
  url: z.string(),
  name: z.string(),
  hash: z.string(),
});

const avatarSchema = z.object({
  id: z.number(),
  ...fileInfoSchema.shape,
  formats: z
    .object({
      thumbnail: fileInfoSchema.optional(),
      small: fileInfoSchema.optional(),
      medium: fileInfoSchema.optional(),
      large: fileInfoSchema.optional(),
    })
    .optional(),
}).nullable().optional();

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
  authorUser: z.union([
    z.string(), 
    z.object({ 
      id: z.number(), 
      username: z.string(), 
      email: z.string().email(),
      avatar: avatarSchema,
    })
  ]).optional().nullable(),
  locale: z.string().nullable(),
});
