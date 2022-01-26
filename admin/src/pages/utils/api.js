import { stringify } from 'qs';
import { isEmpty } from 'lodash';

import { getApiURL, axiosInstance, handleAPIError } from '../../utils';

// eslint-disable-next-line import/prefer-default-export
export const fetchDetailsData = async (id, queryParams, toggleNotification) => {
  try {
    const stringifiedProps = !isEmpty(queryParams) ? `?${stringify(queryParams, { encode: false })}` : '';
    const { data } = await axiosInstance.get(getApiURL(`moderate/single/${id}${stringifiedProps}`));

    return data;
  } catch (err) {
    handleAPIError(err, toggleNotification);
  }
};

export const fetchContentTypeData = async (uid, toggleNotification) => {
  try {
    const { data } = await axiosInstance.get(`/content-type-builder/content-types/${uid}`);
    return data?.data;
  } catch (err) {
    handleAPIError(err, toggleNotification);
  }
};

export const blockItem = id => {
  return axiosInstance.patch(getApiURL(`moderate/single/${id}/block`));
};

export const unblockItem = id => {
  return axiosInstance.patch(getApiURL(`moderate/single/${id}/unblock`));
};

export const approveItem = id => {
  return axiosInstance.patch(getApiURL(`moderate/single/${id}/approve`));
};

export const rejectItem = id => {
  return axiosInstance.patch(getApiURL(`moderate/single/${id}/reject`));
};

export const blockItemThread = id => {
  return axiosInstance.patch(getApiURL(`moderate/thread/${id}/block`));
};

export const unblockItemThread = id => {
  return axiosInstance.patch(getApiURL(`moderate/thread/${id}/unblock`));
};

export const resolveReport = ({ id, reportId }) => {
  return axiosInstance.patch(getApiURL(`moderate/single/${id}/report/${reportId}/resolve`));
};