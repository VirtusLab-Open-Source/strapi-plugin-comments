import { z } from 'zod';
import { REPORT_REASON } from '../../../const/REPORT_REASON';
import { ExtractRightEither } from '../../../utils/Either';
import { AVAILABLE_OPERATORS, filtersValidator, getFiltersOperators, getFindQueryValidator, getStringToNumberValidator, stringToNumberValidator, validate } from '../../utils';

export const getIdValidator = (params: unknown) => {
  return validate(getStringToNumberValidator({ id: AVAILABLE_OPERATORS.single }).safeParse(params));
};

export type IdValidatorSchema = ExtractRightEither<ReturnType<typeof getIdValidator>>;

const entryFilters = getFiltersOperators({ content: true, authorName: true, createdAt: true, updatedAt: true })
.merge(z.object({
  threadOf: stringToNumberValidator.optional(),
}));

const commentValidator = getFindQueryValidator(entryFilters);

export const getCommentQueryValidator = (query: unknown) => {
  return validate(commentValidator.safeParse(query));
};

export type CommentQueryValidatorSchema = z.infer<typeof commentValidator>;

const reportValidator = getFindQueryValidator(z
.object({
  content: filtersValidator.optional(),
  reason: z.nativeEnum(REPORT_REASON).optional(),
  resolved: z.boolean().optional(),
  // TODO: check relation
  // createdAt: zodDynamicValueOperators,
  // updatedAt: zodDynamicValueOperators,
  // threadOf: z.object({ id: zodDynamicValueOperators }).optional(),
}));
export const getReportQueryValidator = (query: unknown) => {
  return validate(reportValidator.safeParse(query));
};

export type ReportQueryValidatorSchema = z.infer<typeof reportValidator>;

export const getFindOneValidator = (id: string | number, params: object) => {
  const result = getStringToNumberValidator({ id: AVAILABLE_OPERATORS.single })
  .merge(entryFilters)
  .merge(z.object({
    removed: z.string().optional().transform((v) => v === 'true'),
  })).safeParse({ ...params, id });

  return validate(result);
};

export type FindOneValidatorSchema = ExtractRightEither<ReturnType<typeof getFindOneValidator>>;

export const getResolveAbuseReportValidator = (params: unknown) => {
  return validate(getStringToNumberValidator({ id: AVAILABLE_OPERATORS.single, reportId: AVAILABLE_OPERATORS.single }).safeParse(params));
};

export type ResolveAbuseReportValidatorSchema = ExtractRightEither<ReturnType<typeof getResolveAbuseReportValidator>>;

export const getResolveCommentMultipleAbuseReportsValidator = (params: unknown) => {
  const result = getStringToNumberValidator({ id: AVAILABLE_OPERATORS.single, reportIds: AVAILABLE_OPERATORS.array })
  .safeParse(params);

  return validate(result);
};

export const getMultipleAbuseReportsValidator = (params: unknown) => {
  const result = getStringToNumberValidator({ reportIds: AVAILABLE_OPERATORS.array })
  .safeParse(params);

  return validate(result);
};
export type MultipleAbuseReportsValidatorSchema = ExtractRightEither<ReturnType<typeof getMultipleAbuseReportsValidator>>;

export type ResolveCommentMultipleAbuseReportsValidatorSchema = ExtractRightEither<ReturnType<typeof getResolveCommentMultipleAbuseReportsValidator>>;

export const postCommentValidator = z.object({
  id: z.union([z.string(), z.number()]),
  content: z.string(),
  author: z.object({
    id: z.union([z.string(), z.number()]),
    email: z.string().email(),
    lastname: z.string().optional(),
    username: z.string().optional(),
    firstname: z.string().optional(),
  }),
});

export const getPostCommentValidator = (params: unknown) => {
  return validate(postCommentValidator.safeParse(params));
};

export type PostCommentValidatorSchema = z.infer<typeof postCommentValidator>;

export const getUpdateCommentValidator = (params: unknown) => {
  return validate(postCommentValidator.pick({ content: true, id: true }).safeParse(params));
};

export type UpdateCommentValidatorSchema = ExtractRightEither<ReturnType<typeof getUpdateCommentValidator>>;
