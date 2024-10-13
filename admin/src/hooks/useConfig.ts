import { getFetchClient } from '@strapi/strapi/admin';
import { useQuery } from '@tanstack/react-query';
import { getApiClient } from '../api';

export const useConfig = () => {
  const fetch = getFetchClient();
  const apiClient = getApiClient(fetch);
  return useQuery({
    queryKey: apiClient.readSettingsConfigIndex(),
    queryFn() {
      return apiClient.readSettingsConfig();
    },
    staleTime: 1000 * 60 * 5,
  });
}