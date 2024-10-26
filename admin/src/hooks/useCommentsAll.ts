import { getFetchClient } from '@strapi/strapi/admin';
import { useQuery } from '@tanstack/react-query';
import { orderBy } from 'lodash';
import { getApiClient } from '../api';

export const useCommentsAll = (queryParams: Record<string, string>) => {
  const fetch = getFetchClient();
  const apiClient = getApiClient(fetch);
  return useQuery({
    queryKey: apiClient.getCommentsKey(queryParams),
    queryFn: () => apiClient.getComments(queryParams).then(res => ({
      ...res,
      result: res.result.map((item) => ({
        ...item,
        reports: orderBy(item.reports, ['resolved', 'createdAt'], ['desc', 'desc']),
      }))
    })).catch((error) => {
      console.log('error', error);
      throw error;
    }),
    initialData: { result: [], pagination: { page: 0, pageSize: 0, pageCount: 0, total: 0 } },
  });
};