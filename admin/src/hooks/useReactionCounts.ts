import { useQuery } from '@tanstack/react-query';
import { Data } from '@strapi/strapi';
import { useFetchClient } from '@strapi/strapi/admin';
import { fetchReactionCounts } from '../utils/reactionsIntegration';
import { ValidationError } from '../utils/errors';

export const useReactionCounts = (documentId: Data.DocumentID, locale?: string | null) => {
  const { get } = useFetchClient();

  return useQuery({
    queryKey: ['comments-reactions-counts', documentId, locale],
    queryFn: () => {
      if (!documentId) {
        throw new ValidationError('documentId is required to fetch reaction counts');
      }

      return fetchReactionCounts(documentId, locale || undefined, get);
    },
    enabled: Boolean(documentId),
    retry: false,
  });
};
