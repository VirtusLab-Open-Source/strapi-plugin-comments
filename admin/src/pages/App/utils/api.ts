// @ts-nocheck

import { getApiURL, axiosInstance, handleAPIError } from "../../../utils";

// eslint-disable-next-line import/prefer-default-export
export const fetchConfig = async (toggleNotification) => {
  try {
    const { data } = await axiosInstance.get(getApiURL(`moderate/config`));

    return data;
  } catch (err) {
    handleAPIError(err, toggleNotification);
  }
};
