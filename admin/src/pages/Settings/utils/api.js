import { getApiURL, axiosInstance, handleAPIError } from '../../../utils';

// eslint-disable-next-line import/prefer-default-export
export const fetchConfig = async (toggleNotification) => {
  try {
    const { data } = await axiosInstance.get(getApiURL(`moderate/config`));

    return data;
  } catch (err) {
    handleAPIError(err, toggleNotification);
  }
};

export const updateConfig = async (body, toggleNotification) => {
  try {
    const { data } = await axiosInstance.put(getApiURL(`moderate/config`), body);

    return data;
  } catch (err) {
    handleAPIError(err, toggleNotification);
  }
};

export const restoreConfig = async (toggleNotification) => {
  try {
    const { data } = await axiosInstance.delete(getApiURL(`moderate/config`));

    return data;
  } catch (err) {
    handleAPIError(err, toggleNotification);
  }
};

export const fetchAllContentTypes = async (toggleNotification) => {
  try {
    const { data } = await axiosInstance.get(`/content-type-builder/content-types`);
    return data?.data;
  } catch (err) {
    handleAPIError(err, toggleNotification);
  }
};