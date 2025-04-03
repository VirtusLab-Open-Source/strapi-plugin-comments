import { z } from 'zod';
import { CommentsPluginConfig } from '../../../config';
import { APPROVAL_STATUS } from '../../../const';
import { AUTHOR_TYPE, CONFIG_PARAMS } from '../../../utils/constants';
import { ExtractRightEither } from '../../../utils/Either';
import { AVAILABLE_OPERATORS, externalAuthorSchema, getFiltersOperators, getRelationValidator, getStringToNumberValidator, orderByValidator, stringToBooleanValidator, stringToNumberValidator, validate } from '../../utils';

const getCommentSchema = (enabledCollections: string[]) => {
  return z.object({
    relation: getRelationValidator(enabledCollections),
    content: z.string().min(1),
    author: externalAuthorSchema.optional(),
    threadOf: z.union([z.string(), z.number()]).optional(),
    approvalStatus: z.nativeEnum(APPROVAL_STATUS).optional(),
    locale: z.string().optional(),
    rating: z.number().min(0).max(5).step(0.5).optional(),
  });
};

export const newCommentValidator = (
  enabledCollections: string[],
  relation: string,
  payload: object,
) => {
  return validate(getCommentSchema(enabledCollections).safeParse({
    ...payload,
    relation,
  }));
};

export type NewCommentValidatorSchema = ExtractRightEither<ReturnType<typeof newCommentValidator>>;

export const updateCommentValidator = (
  enabledCollections: string[],
  payload: object,
) => {
  return validate(
    getCommentSchema(enabledCollections).pick({ content: true, relation: true, author: true, rating: true })
                                        .merge(getStringToNumberValidator({ commentId: AVAILABLE_OPERATORS.single }))
                                        .safeParse(payload),
  );
};

export type UpdateCommentValidatorSchema = ExtractRightEither<ReturnType<typeof updateCommentValidator>>;

const getRelationSchema = (enabledCollections: string[]) => z.object({
  relation: getRelationValidator(enabledCollections),
});

const paginationSchema = z.object({
  pagination: z.object({
    pageSize: stringToNumberValidator.default(10),
    page: stringToNumberValidator.default(1),
    withCount: stringToBooleanValidator.optional().default(false),
  }).optional(),
});

const getBaseFindSchema = (enabledCollections: string[]) => {
  return z
    .object({
      sort: orderByValidator.optional().nullable().default('createdAt:desc'),
      fields: z.string().array().optional(),
      omit: z.string().array().optional(),
      filters: getFiltersOperators({
        id: true,
        content: true,
        authorId: true,
        authorName: true,
        authorEmail: true,
        createdAt: true,
        updatedAt: true,
        removed: true,
        blocked: true,
        blockedThread: true,
        approvalStatus: true,
        rating: true,
      }).optional(),
      isAdmin: z.boolean().optional().default(false),
      populate: z
        .record(z.union([z.boolean(), z.object({ populate: z.boolean() })]))
        .optional(),
      limit: stringToNumberValidator.optional(),
      skip: stringToNumberValidator.optional(),
      locale: z.string().optional(),
    })
    .merge(getRelationSchema(enabledCollections))
    .merge(paginationSchema);
};
export const findAllFlatValidator = (enabledCollections: string[], relation: string, payload: object) => {

  return validate(getBaseFindSchema(enabledCollections).safeParse({
    ...payload,
    relation,
  }));
};

export type FindAllFlatSchema = ExtractRightEither<ReturnType<typeof findAllFlatValidator>>;

export const findAllInHierarchyValidator = (enabledCollections: string[], relation: string, payload: object) => {
  const schema = getBaseFindSchema(enabledCollections)
  .pick({
    sort: true,
    fields: true,
    omit: true,
    filters: true,
    isAdmin: true,
    populate: true,
    limit: true,
    skip: true,
    relation: true,
    locale: true,
  })
  .merge(z.object({
    startingFromId: z.number().optional(),
    dropBlockedThreads: z.boolean().optional().default(false),
  }));

  return validate(schema.safeParse({
    ...payload,
    relation,
  }));
};

export type FindAllInHierarchyValidatorSchema = ExtractRightEither<ReturnType<typeof findAllInHierarchyValidator>>;

export const findAllPerAuthorValidator = (params: object, payload: object) => {
  const schema = getBaseFindSchema([])
  .pick({
    sort: true,
    fields: true,
    omit: true,
    isAdmin: true,
    populate: true,
    limit: true,
    skip: true,
    pagination: true,
    filters: true,
    locale: true,
  })
  .merge(z.object({
    type: z.union([z.literal(AUTHOR_TYPE.GENERIC), z.literal('generic')]).optional(),
    authorId: z.union([z.string(), z.number()]),
  }));


  return validate(schema.safeParse({
    ...payload,
    ...params,
  }));
};

export type FindAllPerAuthorValidatorSchema = ExtractRightEither<ReturnType<typeof findAllPerAuthorValidator>>;

const getReportAbuseSchema = (config: CommentsPluginConfig) => {
  return z.object({
    relation: getRelationValidator(config[CONFIG_PARAMS.ENABLED_COLLECTIONS]),
    commentId: stringToNumberValidator,
    content: z.string().min(1),
    reason: z.nativeEnum(config.reportReasons),
  });
};

export const reportAbuseValidator = (
  config: CommentsPluginConfig,
  payload: object,
) => {
  return validate(getReportAbuseSchema(config).safeParse(payload));
};

export type ReportAbuseValidatorSchema = ExtractRightEither<ReturnType<typeof reportAbuseValidator>>;

const getRemoveCommentSchema = (enabledCollections: string[]) => {
  return z.object({
    relation: getRelationValidator(enabledCollections),
    commentId: z.union([z.string(), z.number()]),
    authorId: z.union([z.string(), z.number()]),
  });
};

export const removeCommentValidator = (
  enabledCollections: string[],
  payload: object,
) => {
  return validate(getRemoveCommentSchema(enabledCollections).safeParse(payload));
};

export type RemoveCommentValidatorSchema = ExtractRightEither<ReturnType<typeof removeCommentValidator>>;
