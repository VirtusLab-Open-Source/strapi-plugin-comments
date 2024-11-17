import { z } from 'zod';
import { APPROVAL_STATUS } from '../../../const';
import { AUTHOR_TYPE } from '../../../utils/constants';
import { ExtractRightEither } from '../../../utils/Either';
import { AVAILABLE_OPERATORS, externalAuthorSchema, filtersValidator, getFiltersOperators, getRelationValidator, getStringToNumberValidator, orderByValidator, primitiveUnion, stringToBooleanValidator, stringToNumberValidator, validate } from '../../utils';

const getCommentSchema = (enabledCollections: string[]) => {
  return z.object({
    relation: getRelationValidator(enabledCollections),
    content: z.string().min(1),
    author: externalAuthorSchema.optional(),
    threadOf: z.number().optional(),
    approvalStatus: z.nativeEnum(APPROVAL_STATUS).optional(),
    locale: z.string().optional(),
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
    getCommentSchema(enabledCollections).pick({ content: true, relation: true })
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
    filters: getFiltersOperators({ content: true, authorName: true, createdAt: true, updatedAt: true, id: true }).optional(),
    isAdmin: z.boolean().optional().default(false),
    populate: z.record(z.union([z.boolean(), z.object({ populate: z.boolean() })])).optional(),
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

const getReportAbuseSchema = (enabledCollections: string[]) => {
  return z.object({
    relation: getRelationValidator(enabledCollections),
    commentId: z.number(),
    content: z.string().min(1),
    reason: z.string().min(1),
  });
};

export const reportAbuseValidator = (
  enabledCollections: string[],
  payload: object,
) => {
  return validate(getReportAbuseSchema(enabledCollections).safeParse(payload));
};

export type ReportAbuseValidatorSchema = ExtractRightEither<ReturnType<typeof reportAbuseValidator>>;

const getRemoveCommentSchema = (enabledCollections: string[]) => {
  return z.object({
    relation: getRelationValidator(enabledCollections),
    commentId: z.number(),
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
