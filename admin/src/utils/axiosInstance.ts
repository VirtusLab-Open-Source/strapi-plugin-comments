import axios, { AxiosError, AxiosRequestHeaders, InternalAxiosRequestConfig, AxiosResponse } from "axios";
// @ts-ignore
import { auth } from "@strapi/helper-plugin";

const instance = axios.create({
  baseURL: process.env.STRAPI_ADMIN_BACKEND_URL,
});

instance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    config.headers = {
      Authorization: `Bearer ${auth.getToken()}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    } as AxiosRequestHeaders;

    return config;
  },
  (error: AxiosError) => {
    Promise.reject(error);
  },
);

instance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      auth.clearAppStorage();
      window.location.reload();
    }

    throw error;
  },
);

export default instance;
