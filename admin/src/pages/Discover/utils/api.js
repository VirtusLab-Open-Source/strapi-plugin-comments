import { stringify } from 'qs';
import { isEmpty } from 'lodash';

import { getApiURL, axiosInstance } from '../../../utils';

// eslint-disable-next-line import/prefer-default-export
export const fetchData = async (queryParams, toggleNotification) => {
  try {
    console.log('api');
    console.log(queryParams);
    console.log(getApiURL(`moderate/all${!isEmpty(queryParams) ? `?${stringify(queryParams, { encode: false })}` : ''}`));
    const { data } = await axiosInstance.get(getApiURL(`moderate/all${queryParams ? `?${stringify(queryParams, { encode: false })}` : ''}`));

    return data;
  } catch (err) {
    toggleNotification({
      type: 'warning',
      message: { id: 'notification.error' },
    });

    throw new Error('error');
  }
};
