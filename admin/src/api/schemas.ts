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
  badWords: z.boolean().nullable().optional(),
  gql: z.object({
    auth: z.boolean().nullable(),
  }).optional(),
  client: z.object({
    url: z.string().nullable(),
    contactEmail: z.string().nullable(),
  }).default({ url: null, contactEmail: null }),
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
    locale: z.string().nullable().optional(),
  }),
  z.record(z.unknown()),
);

const authorSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string().optional().nullable(),
  email: z.string(),
  avatar: z
    .union([
      z.object({
        url: z.string(),
      }),
      z.object({
        url: z.string(),
        formats: z.object({
          thumbnail: z
            .object({
              url: z.string(),
            })
            .nullable(),
        }),
      }),
      z.string(),
    ])
    .nullable()
    .optional(),
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
const reportReasonUnion = z.union([
  z.literal('BAD_LANGUAGE'),
  z.literal('DISCRIMINATION'),
  z.literal('OTHER'),
]);
const commentReportSchema = z.object({
  id: z.number(),
  reason: reportReasonUnion,
  content: z.string(),
  resolved: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});
const baseCommentSchema = z.object({
  id: z.number(),
  content: z.string(),
  blocked: z.boolean().nullable(),
  blockedThread: z.boolean().nullable(),
  blockReason: z.string().nullable(),
  isAdminComment: z.boolean().nullable(),
  removed: z.boolean().nullable(),
  approvalStatus: approvalStatusSchema.nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  reports: z.array(commentReportSchema).nullable().optional(),
  author: authorSchema,
  gotThread: z.boolean().nullable().optional(),
  threadFirstItemId: z.number().nullable().optional(),
});

type BaseComment = z.infer<typeof baseCommentSchema>;


const paginationSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  pageCount: z.number(),
  total: z.number(),
});

// const threadOfSchema = baseCommentSchema.omit({ related: true }).merge(z.object({ related: z.string(), threadOf: commentSchema.nullable().optional() }));
export type CommentReport = z.infer<typeof commentReportSchema>;

function getCommentSchema() {
  return baseCommentSchema.extend({
    related: relatedSchema.optional(),
    documentId: z.string(),
    threadOf: z.lazy(() =>
      baseCommentSchema.merge(z.object({ related: z.string(), threadOf: commentSchema.nullable().optional(), documentId: z.string().optional() })),
    ).nullable().optional(),
  });
}

const commentSchema: z.ZodType<Comment> = getCommentSchema();

export type Comment = BaseComment & {
  threadOf?: Comment | null
  related?: z.infer<typeof relatedSchema> | string
  documentId?: string
};


export const commentsSchema = z.object({
  pagination: paginationSchema,
  result: z.array(commentSchema),
});


export const commentDetailsSchema = z.object({
  entity: relatedSchema,
  selected: baseCommentSchema
    .merge(
      z.object({
        related: z.string(),
        threadOf: getCommentSchema()
          .omit({ related: true })
          .merge(z.object({ related: z.string() }))
          .nullable()
          .optional(),
      })
    )
    .nullable(),
  level: z.array(getCommentSchema().omit({ threadOf: true, related: true })),
});

export type CommentDetails = z.infer<typeof commentDetailsSchema>;


const singleContentTypeSchema = z.object({
  apiID: z.string(),
  uid: z.string(),
  schema: z.object({
    attributes: z.record(z.object({ type: z.union([z.literal('string'), z.string()]) })),
    collectionName: z.string(),
    description: z.string(),
    displayName: z.string(),
    draftAndPublish: z.boolean(),
    kind: z.string(),
    pluralName: z.string(),
    singularName: z.string(),
    visible: z.boolean(),
  }),
});
export const contentTypeSchema = z.object({
  data: singleContentTypeSchema,
});

export const contentTypesSchema = z.object({
  data: z.array(singleContentTypeSchema),
});

export type ContentType = z.infer<typeof contentTypeSchema>;

export const reportSchema = z.object({
  author: z.unknown(),
  content: z.string(),
  id: z.number(),
  approvalStatus: approvalStatusSchema.nullable().optional(),
  reason: reportReasonUnion,
  reports: z.array(z.unknown()),
  resolved: z.boolean().optional(),
  updatedAt: z.string().nullable(),
  createdAt: z.string(),
  related: baseCommentSchema,
});

export type Report = z.infer<typeof reportSchema>;

export const reportsSchema = z.object({
  pagination: paginationSchema,
  result: z.array(reportSchema),
});


const roleSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  name: z.string(),
  code: z.string(),
  description: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string(),
  locale: z.string().nullable(),
  usersCount: z.number(),
});
export const rolesListSchema = z.object({
  data: z.array(
    roleSchema,
  ),
});

export const userSchema = z.object({
  data: z.object({
    id: z.number(),
    documentId: z.string(),
    firstname: z.string(),
    lastname: z.string(),
    username: z.string().nullable(),
    email: z.string(),
    isActive: z.boolean(),
    blocked: z.boolean(),
    preferedLanguage: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    publishedAt: z.string(),
    locale: z.null(),
    roles: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        description: z.string(),
        code: z.string(),
      }),
    ),
  }),
});

export type User = z.infer<typeof userSchema>['data'];
