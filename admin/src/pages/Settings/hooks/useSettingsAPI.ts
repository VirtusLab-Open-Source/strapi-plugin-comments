import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAPI } from '../../../hooks/useAPI';

type MutationKey = {
  restoreSettingsMutation: boolean;
  updateSettingsMutation: boolean;
  restartStrapiMutation: boolean;
}

type CallbacksMutation = {
  [L in keyof MutationKey as `${L & string}${'Success' | 'Error'}`]?: () => void;
}

export const useSettingsAPI = (callbacksMutation: CallbacksMutation = {}) => {
  const api = useAPI();

  const updateSettingsMutation = useMutation({
    mutationFn: api.settings.update,
    onSuccess: callbacksMutation.updateSettingsMutationSuccess,
    onError: callbacksMutation.updateSettingsMutationError,
  });

  const restoreSettingsMutation = useMutation({
    mutationFn: api.settings.restore,
    onSuccess: callbacksMutation.restoreSettingsMutationSuccess,
    onError: callbacksMutation.restoreSettingsMutationError,
  });

  const restartStrapiMutation = useMutation({
    mutationFn: api.settings.restart,
    onSuccess: callbacksMutation.restartStrapiMutationSuccess,
    onError: callbacksMutation.restartStrapiMutationError,
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