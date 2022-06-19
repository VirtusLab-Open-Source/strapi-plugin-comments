// @ts-nocheck

import {stringify} from 'qs';

import {getApiURL, axiosInstance, handleAPIError} from '../../../utils';

export const fetchReportsData = async (queryParams, toggleNotification) => {
  try {
    const { data } = await axiosInstance.get(
      getApiURL(
        `moderate/reports${
          queryParams ? `?${stringify(queryParams, { encode: false })}` : ""
        }`,
      ),
    );

    return data;
  } catch (err) {
    handleAPIError(err, toggleNotification);
  }
};
