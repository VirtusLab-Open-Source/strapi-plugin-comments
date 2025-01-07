import { useQuery } from '@tanstack/react-query';
import { orderBy } from 'lodash';
import { useAPI } from './useAPI';

export const useCommentsAll = (queryParams: Record<string, string>) => {
  const api = useAPI();
  return useQuery({
    queryKey: api.comments.findAll.getKey(queryParams),
    queryFn: () => api.comments.findAll.query(queryParams).then(res => ({
      ...res,
      result: res.result.map((item) => ({
        ...item,
        reports: orderBy(item.reports, ['resolved', 'createdAt'], ['desc', 'desc']),
      })),
    })),
    initialData: { result: [], pagination: { page: 0, pageSize: 0, pageCount: 0, total: 0 } },
  });
};
