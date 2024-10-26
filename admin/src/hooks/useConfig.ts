import { useQuery } from '@tanstack/react-query';
import { Config } from '../api/schemas';
import { useAPI } from './useAPI';

export const useConfig = (setSettings: (settings: Config) => void) => {
  const apiClient = useAPI();
  return useQuery({
    queryKey: apiClient.config.getKey(),
    queryFn: () => apiClient.config
                            .query()
                            .then(response => {
                              setSettings(response);
                              return response;
                            }),
  });
};