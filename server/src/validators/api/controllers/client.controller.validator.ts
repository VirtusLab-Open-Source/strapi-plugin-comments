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

const querySchema = z.object({
  query: z.union([
    z.object({
      $and: z.array(z.record(filtersValidator)).optional(),
      $or: z.array(z.record(filtersValidator)).optional(),
    }),
    z.record(z.union([z.record(primitiveUnion), primitiveUnion])),
  ]).optional(),
});

//   query: z.union([
//       z.record(z.union([z.record(primitiveUnion), primitiveUnion])),
//       z.object({
//         $and: z.array(z.record(filtersValidator)).optional(),
//         $or: z.array(z.record(filtersValidator)).optional(),
//       }),
//     ]).optional(),
// ----------------------------

export const findAllFlatValidator = (enabledCollections: string[], relation: string, payload: object) => {
  const zodObject = z
  .object({
    sort: orderByValidator.optional().nullable().default('createdAt:desc'),
    fields: z.string().optional().array(),
    omit: z.string().optional().array(),
    filter: getFiltersOperators({ content: true, authorName: true, createdAt: true, updatedAt: true }),
    isAdmin: z.boolean().optional().default(false),
    populate: z.record(z.union([z.boolean(), z.object({ populate: z.boolean() })])).optional(),
    query: z.record(z.union([z.record(z.union([z.string(), z.number()])), z.string(), z.number()])).optional(),
  })
  .merge(getStringToNumberValidator({ limit: AVAILABLE_OPERATORS.single, skip: AVAILABLE_OPERATORS.single }))
  .merge(getRelationSchema(enabledCollections))
  .merge(paginationSchema)
  .merge(querySchema);

  return validate(zodObject.safeParse({
    ...payload,
    relation,
  }));
};

export type FindAllFlatSchema = ExtractRightEither<ReturnType<typeof findAllFlatValidator>>;

export const findAllInHierarchyValidator = (enabledCollections: string[], relation: string, payload: object) => {
  const zodObject = z
  .object({
    sort: orderByValidator.optional().nullable().default('createdAt:desc'),
    fields: z.string().optional().array(),
    omit: z.string().optional().array(),
    filter: getFiltersOperators({ content: true, authorName: true, createdAt: true, updatedAt: true }),
    isAdmin: z.boolean().optional().default(false),
    populate: z.record(z.union([z.boolean(), z.object({ populate: z.boolean() })])).optional(),
    query: z.union([
      z.record(z.union([z.record(primitiveUnion), primitiveUnion])),
      z.object({
        $and: z.array(z.record(filtersValidator)).optional(),
        $or: z.array(z.record(filtersValidator)).optional(),
      }),
    ]).optional(),
    startingFromId: z.number().optional(),
    dropBlockedThreads: z.boolean().optional().default(false),

  })
  .merge(getStringToNumberValidator({ limit: AVAILABLE_OPERATORS.single, skip: AVAILABLE_OPERATORS.single }))
  .merge(getRelationSchema(enabledCollections))
  .merge(querySchema);

  return validate(zodObject.safeParse({
    ...payload,
    relation,
  }));
};

export type FindAllInHierarchyValidatorSchema = ExtractRightEither<ReturnType<typeof findAllInHierarchyValidator>>;

export const findAllPerAuthorValidator = (params: object, payload: object) => {
  const zodObject = z.object({
    authorId: z.union([z.string(), z.number()]),
    query: z.record(z.string()).optional(),
    sort: orderByValidator.optional().nullable().default('createdAt:desc'),
    fields: z.string().optional().array(),
    omit: z.string().optional().array(),
    isAdmin: z.boolean().optional().default(false),
    populate: z.record(z.union([z.boolean(), z.object({ populate: z.boolean() })])).optional(),
    type: z.union([z.literal(AUTHOR_TYPE.GENERIC), z.literal('generic')]).optional(),
    pagination: z.object({
      page: z.number().optional(),
      pageSize: z.number().optional(),
    }).optional(),
  }).merge(getStringToNumberValidator({ limit: AVAILABLE_OPERATORS.single, skip: AVAILABLE_OPERATORS.single }));

  return validate(zodObject.safeParse({
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
