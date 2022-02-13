import { useQuery, useMutation, useQueryClient } from 'react-query';
import { fetchConfig, restoreConfig, updateConfig } from '../pages/Settings/utils/api';
import pluginId from '../pluginId';
import { getMessage } from '../utils';

const useConfig = (toggleNotification) => {
  const queryClient = useQueryClient();

  const fetch = useQuery('get-config', () =>
    fetchConfig(toggleNotification)
  );

  const handleError = (type, callback = () => {}) => {
    toggleNotification({
      type: 'warning',
      message: `${pluginId}.page.settings.notification.${type}.error`,
    });
    callback();
  };

  const handleSuccess = (type, callback = () => {}) => {
    queryClient.invalidateQueries('get-config');
    toggleNotification({
      type: 'success',
      message: `${pluginId}.page.settings.notification.${type}.success`,
    });
    callback();
  };

  const submitMutation = useMutation(updateConfig, {
    onSuccess: () => handleSuccess('submit'),
    onError: () => handleError('submit'),
  });

  const restoreMutation = useMutation(restoreConfig, {
    onSuccess: () => handleSuccess('restore'),
    onError: () => handleError('restore'),
  });

  return { fetch, submitMutation, restoreMutation };
};

export default useConfig;
