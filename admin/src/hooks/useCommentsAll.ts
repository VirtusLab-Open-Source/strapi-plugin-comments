import { getFetchClient } from '@strapi/strapi/admin';
import { useQuery } from '@tanstack/react-query';
import { getApiClient } from '../api';

export const useCommentsAll = () => {
  const fetch = getFetchClient();
  const apiClient = getApiClient(fetch);
  return useQuery({
    queryKey: apiClient.getCommentsKey(),
    queryFn: () => apiClient.getComments().catch((error) => {
      console.log('error', error);
      throw error;
    }),
    initialData: { result: [], pagination: { page: 0, pageSize: 0, pageCount: 0, total: 0 } },
  });
};