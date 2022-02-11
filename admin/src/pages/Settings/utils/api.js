import { getApiURL, axiosInstance, handleAPIError } from '../../../utils';

// eslint-disable-next-line import/prefer-default-export
export const fetchConfig = async (toggleNotification) => {
  try {
    const { data } = await axiosInstance.get(getApiURL(`settings/config`));

    return data;
  } catch (err) {
    handleAPIError(err, toggleNotification);
  }
};

export const updateConfig = async (body, toggleNotification) => {
  try {
    const { data } = await axiosInstance.put(getApiURL(`settings/config`), body);

    return data;
  } catch (err) {
    handleAPIError(err, toggleNotification);
  }
};

export const restoreConfig = async (toggleNotification) => {
  try {
    const { data } = await axiosInstance.delete(getApiURL(`settings/config`));

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

export const fetchRoles = async (toggleNotification) => {
  try {
    const { data } = await axiosInstance.get(`/admin/roles`);
    return data;
  } catch (err) {
    handleAPIError(err, toggleNotification);
  }
};