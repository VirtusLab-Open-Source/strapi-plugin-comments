import { z } from 'zod';
import { APPROVAL_STATUS, REGEX } from '../../const';
import { Either, ExtractRightEither, makeLeft, makeRight } from '../../utils/Either';
import PluginError from '../../utils/PluginError';
import { AVAILABLE_OPERATORS, getFiltersOperators, getStringToNumberValidator, orderByValidator } from '../utils';

const getRelationValidator = (enabledCollections: string[]) => z
.string()
.regex(REGEX.relatedUid, {
  message: `Field "relation" got incorrect format, use format like "api::<collection name>.<content type name>:<entity id>"`,
})
.refine(
  (v) => enabledCollections.some((ct) => v.startsWith(ct)),
  'Invalid relation or not enabled collections',
);
const getCreateNewCommentSchema = (enabledCollections: string[]) => {
  return z.object({
    relation: getRelationValidator(enabledCollections),
    content: z.string().min(1),
    author: z
    .object({
      id: z.number(),
      name: z.string().min(1).max(100).optional(),
      email: z.string().email().optional(),
      avatar: z.string().url().optional(),
    })
    .optional(),
    threadOf: z.number().optional(),
    approvalStatus: z.nativeEnum(APPROVAL_STATUS).optional(),
  });
};

export const getCreateNewCommentValidator = (
  enabledCollections: string[],
  relation: string,
  payload: object,
): Either<PluginError, CommentData> => {
  const result = getCreateNewCommentSchema(enabledCollections).safeParse({
    ...payload,
    relation,
  });
  if (!result.success) {
    const message = result.error.issues
    .map((i) => `Path: ${i.path.join('.')} Code: ${i.code} Message: ${i.message}`)
    .join('\n');
    return makeLeft(new PluginError(400, message));
  }
  return makeRight(result.data as CommentData);
};

export type CommentData = Omit<z.infer<ReturnType<typeof getCreateNewCommentSchema>>, 'relation'> & {
  relation: `{${string}::${string}.${number}}`;
};

export const getFindAllFlatCommentsValidator = (enabledCollections: string[], relation: string, payload: object) => {
  const zodObject = z.object({
    relation: getRelationValidator(enabledCollections),
    sort: orderByValidator.optional().nullable().default('createdAt:desc'),
    fields: z.string().optional().array(),
    omit: z.string().optional().array(),
    filter: getFiltersOperators({ content: true, authorName: true, createdAt: true, updatedAt: true }),
    isAdmin: z.boolean().optional().default(false),
    populate: z.record(z.boolean()).optional(),
    query: z.record(z.string()).optional(),
  }).merge(getStringToNumberValidator({ limit: AVAILABLE_OPERATORS.single, skip: AVAILABLE_OPERATORS.single }));

  const result = zodObject.safeParse({
    ...payload,
    relation,
  });

  if (!result.success) {
    const message = result.error.issues
    .map((i) => `Path: ${i.path.join('.')} Code: ${i.code} Message: ${i.message}`)
    .join('\n');
    return makeLeft(new PluginError(400, message));
  }
  return makeRight(result.data);
};

export type FindAllFlatCommentsValidatorSchema = ExtractRightEither<ReturnType<typeof getFindAllFlatCommentsValidator>>;
