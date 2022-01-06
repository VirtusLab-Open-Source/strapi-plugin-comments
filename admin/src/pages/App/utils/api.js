import { stringify } from 'qs';
import { isEmpty } from 'lodash';

import { getApiURL, axiosInstance } from '../../../utils';

// eslint-disable-next-line import/prefer-default-export
export const fetchConfig = async (toggleNotification) => {
  try {
    const { data } = await axiosInstance.get(getApiURL(`moderate/config`));

    return data;
  } catch (err) {
    toggleNotification({
      type: 'warning',
      message: { id: 'notification.error' },
    });

    throw new Error('error');
  }
};
