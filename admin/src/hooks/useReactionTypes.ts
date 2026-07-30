import { useQuery } from '@tanstack/react-query';
import { useFetchClient } from '@strapi/strapi/admin';

import { fetchReactionTypes } from '../utils/reactionsIntegration';

export const useReactionTypes = () => {
  const { get } = useFetchClient();

  return useQuery({
    queryKey: ['comments-reactions-config'],
    queryFn: () => fetchReactionTypes(get),
    retry: false,
  });
};
