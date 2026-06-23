import qs from 'qs';
import { z } from 'zod';
import { Data } from '@strapi/strapi';
import { ValidationError } from './errors';
import type { FetchClient } from '@strapi/strapi/admin';

const reactionTypeSchema = z.object({
  slug: z.string(),
  name: z.string(),
  emoji: z.string().nullable().optional(),
  icon: z
    .object({
      url: z.string().optional(),
    })
    .nullable()
    .optional(),
});

const reactionsConfigSchema = z.object({
  types: z.array(reactionTypeSchema).default([]),
});

const reactionCountsSchema = z.record(z.string(), z.number());

export type ReactionType = z.infer<typeof reactionTypeSchema>;
export type ReactionCounts = z.infer<typeof reactionCountsSchema>;

const parseResponse = <T>(schema: z.ZodType<T>, data: unknown, context: string): T => {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ValidationError(`Invalid ${context}: ${result.error.message}`);
  }

  return result.data;
};

export const fetchReactionTypes = async (get: FetchClient['get']) => {
  const { data } = await get(`/reactions/settings/config`);
  const { types } = parseResponse(reactionsConfigSchema, data, 'reactions types');

  return types;
};

export const fetchReactionCounts = async (
  documentId: Data.DocumentID,
  locale: string | null | undefined,
  get: FetchClient['get']
) => {
  const query = qs.stringify({ locale });
  const { data } = await get(
    `/reactions/zone/count/plugin::comments.comment/${documentId}${query ? `?${query}` : ''}`
  );

  return parseResponse(reactionCountsSchema, data, 'reaction counts');
};
