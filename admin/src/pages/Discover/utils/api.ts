// TODO
// @ts-nocheck

import { stringify } from "qs";

import { getApiURL, axiosInstance, handleAPIError } from "../../../utils";

import { auth } from '@strapi/helper-plugin'

export const fetchData = async (queryParams, toggleNotification) => {
  try {
    const { data } = await axiosInstance.get(
      getApiURL(
        `moderate/all${
          queryParams ? `?${stringify(queryParams, { encode: false })}` : ""
        }`,
      ),
    );

    return data;
  } catch (err) {
    handleAPIError(err, toggleNotification);
  }
};

export const displayComment = async (id) => {
  try {
    const user = auth.getUserInfo();

    return axiosInstance.get(
      getApiURL(`moderate/single/${id}/user/${user.id}/display`)
    )
  } catch (err) {
    handleAPIError(err)
  }
}
