import qs from 'qs';
import { Data } from '@strapi/strapi';

type FetchClient = {
  get: (url: string) => Promise<{ data: unknown }>;
};

export type ReactionType = {
  slug: string;
  name: string;
  emoji?: string | null;
  icon?: { url?: string } | null;
};

export type ReactionCounts = Record<string, number>;

export const fetchReactionTypes = async ({ get }: FetchClient) => {
  const { data } = await get(`/reactions/settings/config`);
  return (data as { types?: Array<ReactionType> })?.types || [];
};

export const fetchReactionCounts = async (
  documentId: Data.DocumentID,
  locale: string | undefined,
  { get }: FetchClient
): Promise<ReactionCounts> => {
  const query = qs.stringify({ locale });
  const { data } = await get(
    `/reactions/zone/count/plugin::comments.comment/${documentId}${query ? `?${query}` : ''}`
  );

  return (data as ReactionCounts) || {};
};
