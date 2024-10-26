import { useQuery } from '@tanstack/react-query';
import { useAPI } from './useAPI';

export const useReports = (queryParams?: Record<string, string>) => {
  const api = useAPI();
  return useQuery({
    queryKey: api.reports.findAll.getKey(),
    queryFn: () => api.reports.findAll.query().then(res => res).catch((error) => {
      console.log('error', error);
      throw error;
    }),
    initialData: { result: [], pagination: { page: 0, pageSize: 0, pageCount: 0, total: 0 } },
  });

};