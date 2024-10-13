import { z } from 'zod';
import { REPORT_REASON } from '../../const/REPORT_REASON';
import { ExtractRightEither, makeLeft, makeRight } from '../../utils/Either';
import PluginError from '../../utils/PluginError';
import { AVAILABLE_OPERATORS, filtersValidator, getFiltersOperators, getStringToNumberValidator, orderByValidator, stringToNumberValidator } from '../utils';


export const getIdValidator = (params: unknown) => {
  const result = getStringToNumberValidator({ id: AVAILABLE_OPERATORS.single }).safeParse(params);

  if (!result.success) {
    const message = result.error.issues
    .map((i) => `Path: ${i.path.join('.')} Code: ${i.code} Message: ${i.message}`)
    .join('\n');
    return makeLeft(new PluginError(400, message));
  }
  return makeRight(result.data);
};

export type IdValidatorSchema = ExtractRightEither<ReturnType<typeof getIdValidator>>;

const getFiltersValidator = <T extends z.ZodRawShape>(filters: z.ZodObject<T>) => {
  return z
  .object(
    {
      $and: z.array(filters.optional()).optional(),
      $or: z.array(filters.optional()).optional(),
    },
    {
      message: 'Filter object must have at least one field or wrong operator',
      required_error: 'Filter object must have at least one field or wrong operator',
      invalid_type_error: 'Filter object must have at least one field or wrong operator',
    },
  );
};

const getFindQueryValidator = <T extends z.ZodRawShape>(filters: z.ZodObject<T>) => {
  return z.object({
    _q: z.string().optional(),
    orderBy: orderByValidator.optional().nullable(),
    pageSize: stringToNumberValidator.default(10),
    page: stringToNumberValidator.default(1),
    filters: getFiltersValidator(filters).optional(),
  });
};

const entryFilters = getFiltersOperators({ content: true, authorName: true, createdAt: true, updatedAt: true })
.merge(getStringToNumberValidator({ threadOf: AVAILABLE_OPERATORS.single }));

const commentValidator = getFindQueryValidator(entryFilters);

export const getCommentQueryValidator = (query: unknown) => {
  const result = commentValidator.safeParse(query);

  if (!result.success) {
    const message = result.error.issues
    .map((i) => `Path: ${i.path.join('.')} Code: ${i.code} Message: ${i.message}`)
    .join('\n');
    return makeLeft(new PluginError(400, message));
  }
  return makeRight(result.data);
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
  const result = reportValidator.safeParse(query);

  if (!result.success) {
    const message = result.error.issues
    .map((i) => `Path: ${i.path.join('.')} Code: ${i.code} Message: ${i.message}`)
    .join('\n');
    return makeLeft(new PluginError(400, message));
  }
  return makeRight(result.data);
};

export type ReportQueryValidatorSchema = z.infer<typeof reportValidator>;


export const getFindOneValidator = (id: string | number, params: object) => {
  const result = getStringToNumberValidator({ id: AVAILABLE_OPERATORS.single })
  .merge(entryFilters)
  .merge(z.object({
    removed: z.boolean().optional(),
  })).safeParse({ ...params, id });

  if (!result.success) {
    const message = result.error.issues
    .map((i) => `Path: ${i.path.join('.')} Code: ${i.code} Message: ${i.message}`)
    .join('\n');
    return makeLeft(new PluginError(400, message));
  }
  return makeRight(result.data);
};

export type FindOneValidatorSchema = ExtractRightEither<ReturnType<typeof getFindOneValidator>>;

export const getResolveAbuseReportValidator = (params: unknown) => {
  const result = getStringToNumberValidator({ id: AVAILABLE_OPERATORS.single, reportId: AVAILABLE_OPERATORS.single }).safeParse(params);

  if (!result.success) {
    const message = result.error.issues
    .map((i) => `Path: ${i.path.join('.')} Code: ${i.code} Message: ${i.message}`)
    .join('\n');
    return makeLeft(new PluginError(400, message));
  }
  return makeRight(result.data);
};

export type ResolveAbuseReportValidatorSchema = ExtractRightEither<ReturnType<typeof getResolveAbuseReportValidator>>;


export const getResolveCommentMultipleAbuseReportsValidator = (params: unknown) => {
  const result = getStringToNumberValidator({ id: AVAILABLE_OPERATORS.single, reportIds: AVAILABLE_OPERATORS.array })
  .safeParse(params);

  if (!result.success) {
    const message = result.error.issues
    .map((i) => `Path: ${i.path.join('.')} Code: ${i.code} Message: ${i.message}`)
    .join('\n');
    return makeLeft(new PluginError(400, message));
  }
  return makeRight(result.data);
};

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
  const result = postCommentValidator.safeParse(params);

  if (!result.success) {
    const message = result.error.issues
    .map((i) => `Path: ${i.path.join('.')} Code: ${i.code} Message: ${i.message}`)
    .join('\n');
    return makeLeft(new PluginError(400, message));
  }
  return makeRight(result.data);
};

export type PostCommentValidatorSchema = z.infer<typeof postCommentValidator>;


export const getUpdateCommentValidator = (params: unknown) => {
  const result = postCommentValidator.pick({ content: true, id: true }).safeParse(params);
  if (!result.success) {
    const message = result.error.issues
    .map((i) => `Path: ${i.path.join('.')} Code: ${i.code} Message: ${i.message}`)
    .join('\n');
    return makeLeft(new PluginError(400, message));
  }
  return makeRight(result.data);
};

export type UpdateCommentValidatorSchema = ExtractRightEither<ReturnType<typeof getUpdateCommentValidator>>;
