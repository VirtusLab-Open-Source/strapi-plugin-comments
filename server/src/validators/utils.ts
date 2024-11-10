import { z, ZodArray, ZodObject } from 'zod';
import { REGEX } from '../const';
import { makeLeft, makeRight } from '../utils/Either';
import PluginError from '../utils/PluginError';

export const equalValidators = z.union([
  z.object({ $eq: z.string().min(1) }),
  z.object({ $eqi: z.string().min(1) }),
]);
export const notEqualValidators = z.union([
  z.object({ $ne: z.string().min(1) }),
  z.object({ $nei: z.string().min(1) }),
]);
export const grantThenValidators = z.union([
  z.object({ $gt: z.string().min(1) }),
  z.object({ $gte: z.string().min(1) }),
]);
export const lessThenValidators = z.union([
  z.object({ $lt: z.string().min(1) }),
  z.object({ $lte: z.string().min(1) }),
]);

export const startWithValidators = z.union([
  z.object({ $startsWith: z.string().min(1) }),
  z.object({ $startsWithi: z.string().min(1) }),
]);
export const endWithValidators = z.union([
  z.object({ $endsWith: z.string().min(1) }),
  z.object({ $endsWithi: z.string().min(1) }),
]);
export const containsValidators = z.union([
  z.object({ $contains: z.string().min(1) }),
  z.object({ $containsi: z.string().min(1) }),
]);
export const notContainsValidators = z.union([
  z.object({ $notContains: z.string().min(1) }),
  z.object({ $notContainsi: z.string().min(1) }),
]);

export const stringToNumberValidator = z
  .union([z.string(), z.number()])
  .transform((value) => Number(value))
  .pipe(z.number());

export const stringToBooleanValidator = z
  .union([z.string(), z.boolean()])
  .transform((value) => typeof value === 'string' ? ['t', 'true'].includes(value) : value)
  .pipe(z.boolean());

export const qOperatorValidator = z.object({
  _q: z.string().optional(),
});
export const orderByValidator = z.string().regex(
  // TODO: check sort options
  /^(createdAt|updatedAt|id):(desc|asc|ASC|DESC)$/,
  'Invalid orderBy options',
);


export const filtersValidator = z.union([
  z.string(),
  z.number(),
  equalValidators,
  notEqualValidators,
  grantThenValidators,
  lessThenValidators,
  startWithValidators,
  endWithValidators,
  containsValidators,
  notContainsValidators,
  z.object({ $notNull: z.boolean() }),
]);

export const getFiltersOperators = <T extends Record<string, boolean>>(dictionary: T): ZodObject<{ [key in keyof T]: typeof filtersValidator }> => {
  return z.object(Object.keys(dictionary).reduce((acc, key) => {
    return {
      ...acc,
      [key]: filtersValidator.optional(),
    };
  }, {} as Record<string, typeof filtersValidator>)) as ZodObject<{ [key in keyof T]: typeof filtersValidator }>;
};

export const getArrayFiltersValidator = <T extends Record<string, boolean>>(dictionary: T) => {
  return z.array(getFiltersOperators(dictionary));
};

export const AVAILABLE_OPERATORS = {
  single: 'single',
  array: 'array',
} as const;

type Result<T extends Record<string, keyof typeof AVAILABLE_OPERATORS>> = ZodObject<{ [key in keyof T]: T[key] extends typeof AVAILABLE_OPERATORS.single ? typeof stringToNumberValidator : ZodArray<typeof stringToNumberValidator> }>;
export const getStringToNumberValidator = <T extends Record<string, keyof typeof AVAILABLE_OPERATORS>>(dictionary: T): Result<T> => {
  const schema = Object.entries(dictionary).reduce((acc, [key, value]) => {
    return {
      ...acc,
      [key]: value === AVAILABLE_OPERATORS.single ? stringToNumberValidator : z.array(stringToNumberValidator),
    };
  }, {} as Record<string, typeof stringToNumberValidator>);

  return z.object(schema) as Result<T>;
};


export const validate = <I, O>(result: z.SafeParseReturnType<I, O>) => {
  if (!result.success) {
    const message = result.error.issues
                          .map((i) => `Path: ${i.path.join('.')} Code: ${i.code} Message: ${i.message}`)
                          .join('\n');
    return makeLeft(new PluginError(400, message));
  }
  return makeRight(result.data);
};

export const getRelationValidator = (enabledCollections: string[]) => z
.string()
.regex(REGEX.relatedUid, {
  message: `Field "relation" got incorrect format, use format like "api::<collection name>.<content type name>:<entity id>"`,
})
.refine(
  (v) => enabledCollections.some((ct) => v.startsWith(ct)),
  'Invalid relation or not enabled collections',
) as z.ZodEffects<z.ZodString, `{${string}::${string}.${number}}`, string>;

export const externalAuthorSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  avatar: z.string().url().optional(),
});

export const getFiltersValidator = <T extends z.ZodRawShape>(filters: z.ZodObject<T>) => {
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

export const getFindQueryValidator = <T extends z.ZodRawShape>(filters: z.ZodObject<T>) => {
  return z.object({
    _q: z.string().optional(),
    orderBy: orderByValidator.optional().nullable(),
    pageSize: stringToNumberValidator.default(10),
    page: stringToNumberValidator.default(1),
    filters: getFiltersValidator(filters).optional(),
  });
};
export const primitiveUnion = z.union([z.string(), z.number(), z.boolean()]);
