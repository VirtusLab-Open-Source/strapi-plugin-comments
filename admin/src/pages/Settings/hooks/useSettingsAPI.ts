import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAPI } from '../../../hooks/useAPI';

export const useSettingsAPI = () => {
  const api = useAPI();

  const updateSettingsMutation = useMutation({
    mutationFn: api.settings.update,
  });

  const restoreSettingsMutation = useMutation({
    mutationFn: api.settings.restore,
  });

  const restartStrapiMutation = useMutation({
    mutationFn: api.settings.restart,
  });

  const config = useQuery({
    queryKey: api.config.getKey(),
    queryFn: api.config.query,
  });

  const collectionTypes = useQuery({
    queryKey: api.contentTypeBuilder.all.getKey(),
    queryFn: api.contentTypeBuilder.all.query,
  });

  const roles = useQuery({
    queryKey: api.roles.getKey(),
    queryFn: api.roles.query,
  });


  return useMemo(() => ({
    config,
    collectionTypes,
    roles,
    restoreSettingsMutation,
    updateSettingsMutation,
    restartStrapiMutation,
  }), [
    config,
    roles,
    collectionTypes,
    restoreSettingsMutation,
    updateSettingsMutation,
    restartStrapiMutation,
  ]);
};