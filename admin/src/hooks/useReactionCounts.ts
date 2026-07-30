import { useQuery } from '@tanstack/react-query';
import { Data } from '@strapi/strapi';
import { useFetchClient } from '@strapi/strapi/admin';
import { fetchReactionCounts } from '../utils/reactionsIntegration';
import { assertNonEmpty } from 'src/utils/functions';

export const useReactionCounts = (documentId: Data.DocumentID, locale?: string | null) => {
  const { get } = useFetchClient();

  return useQuery({
    queryKey: ['comments-reactions-counts', documentId, locale],
    queryFn: () => {
      assertNonEmpty<Data.DocumentID>(documentId);

      return fetchReactionCounts(documentId, locale || undefined, get);
    },
    enabled: Boolean(documentId),
    retry: false,
  });
};
