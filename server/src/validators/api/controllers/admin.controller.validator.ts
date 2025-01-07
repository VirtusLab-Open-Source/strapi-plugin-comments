import { z } from 'zod';
import { ExtractRightEither } from '../../../utils/Either';
import { AVAILABLE_OPERATORS, getStringToNumberValidator, queryPaginationSchema, validate } from '../../utils';

export const baseAdminPanelQuery = queryPaginationSchema.merge(z.object({ _q: z.string().optional() }));

export const getIdValidator = (params: unknown) => {
  return validate(getStringToNumberValidator({ id: AVAILABLE_OPERATORS.single }).safeParse(params));
};

export type IdValidatorSchema = ExtractRightEither<ReturnType<typeof getIdValidator>>;


export const getCommentFindAllValidator = (query: unknown) => {
  return validate(baseAdminPanelQuery.safeParse(query));
};

export type CommentFindAllSchema = ExtractRightEither<ReturnType<typeof getCommentFindAllValidator>>;

export const getReportFindReportsValidator = (query: unknown) => {
  return validate(baseAdminPanelQuery.safeParse(query));
};
export type ReportFindReportsValidator = ExtractRightEither<ReturnType<typeof getReportFindReportsValidator>>;


export const getCommentFindOneValidator = (id: string | number, params: object) => {
  const result = getStringToNumberValidator({ id: AVAILABLE_OPERATORS.single })
  .merge(z.object({ removed: z.string().optional().transform((v) => v === 'true') }))
  .safeParse({ ...params, id });

  return validate(result);
};

export type FindOneValidatorSchema = ExtractRightEither<ReturnType<typeof getCommentFindOneValidator>>;

export const getCommentResolveAbuseReportValidator = (params: unknown) => {
  return validate(getStringToNumberValidator({ id: AVAILABLE_OPERATORS.single, reportId: AVAILABLE_OPERATORS.single }).safeParse(params));
};

export type CommentResolveAbuseReportValidatorSchema = ExtractRightEither<ReturnType<typeof getCommentResolveAbuseReportValidator>>;

export const getCommentResolveMultipleAbuseReportsValidator = (params: unknown) => {
  const result = getStringToNumberValidator({ id: AVAILABLE_OPERATORS.single, reportIds: AVAILABLE_OPERATORS.array })
  .safeParse(params);

  return validate(result);
};

export type CommentResolveMultipleAbuseReportsValidatorSchema = ExtractRightEither<ReturnType<typeof getCommentResolveMultipleAbuseReportsValidator>>;

export const getReportsMultipleAbuseValidator = (params: unknown) => {
  const result = getStringToNumberValidator({ reportIds: AVAILABLE_OPERATORS.array })
  .safeParse(params);

  return validate(result);
};
export type ReportsMultipleAbuseValidator = ExtractRightEither<ReturnType<typeof getReportsMultipleAbuseValidator>>;

const authorSchema = z.object({
  id: z.union([z.string(), z.number()]),
  email: z.string().email(),
  lastname: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  firstname: z.string().nullable().optional(),
});
export const postCommentValidator = z.object({
  id: z.union([z.string(), z.number()]),
  content: z.string(),
  author: authorSchema,
});

export const getCommentPostValidator = (params: unknown) => {
  return validate(postCommentValidator.safeParse(params));
};

export type CommentPostValidatorSchema = z.infer<typeof postCommentValidator>;

export const getUpdateCommentValidator = (params: unknown) => {
  return validate(postCommentValidator.pick({ content: true, id: true }).safeParse(params));
};

export type UpdateCommentValidatorSchema = ExtractRightEither<ReturnType<typeof getUpdateCommentValidator>>;
