import { getFetchClient } from '@strapi/strapi/admin';
import { useMemo } from 'react';
import { getApiClient } from '../api';

export const useAPI = () => {
  const fetch = getFetchClient();
  return useMemo(() => getApiClient(fetch), [fetch]);
};