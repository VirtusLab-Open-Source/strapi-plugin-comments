import { z } from 'zod';
import { REGEX } from '../../../const';

export const getRelationValidator = (enabledCollections: string[]) => z
.string()
.regex(REGEX.relatedUid, {
  message: `Field "relation" got incorrect format, use format like "api::<collection name>.<content type name>:<entity id>"`,
})
.refine(
  (v) => enabledCollections.some((ct) => v.startsWith(ct)),
  'Invalid relation or not enabled collections',
) as z.ZodEffects<z.ZodString, `{${string}::${string}.${number}}`, string>;


export const externalAuthorSchema = z
.object({
  id: z.number(),
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  avatar: z.string().url().optional(),
});