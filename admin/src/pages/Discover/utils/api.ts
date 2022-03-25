// @ts-nocheck

import { stringify } from "qs";

import { getApiURL, axiosInstance, handleAPIError } from "../../../utils";

// eslint-disable-next-line import/prefer-default-export
export const fetchData = async (queryParams, toggleNotification) => {
  try {
    const { data } = await axiosInstance.get(
      getApiURL(
        `moderate/all${
          queryParams ? `?${stringify(queryParams, { encode: false })}` : ""
        }`
      )
    );

    return data;
  } catch (err) {
    handleAPIError(err, toggleNotification);
  }
};
