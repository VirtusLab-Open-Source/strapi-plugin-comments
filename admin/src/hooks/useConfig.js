import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNotification } from '@strapi/helper-plugin';
import { fetchConfig } from '../pages/App/utils/api';
import { restoreConfig, updateConfig } from '../pages/Settings/utils/api';
import { getMessage } from '../utils';

const useConfig = () => {
  const queryClient = useQueryClient();
  const toggleNotification = useNotification();
  const fetch = useQuery('get-config', () =>
    fetchConfig(toggleNotification)
  );

  const handleError = (type) => {
    toggleNotification({
      type: 'warning',
      message: getMessage(`page.settings.notification.${type}.error`),
    });
  };

  const handleSuccess = (type) => {
    queryClient.invalidateQueries('get-config');
    toggleNotification({
      type: 'success',
      message: getTrad(`page.settings.notification.${type}.success`),
    });
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
