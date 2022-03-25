// @ts-ignore
import axios from 'axios';
// @ts-ignore
import { auth } from '@strapi/helper-plugin';
import { ToBeFixed } from '../../../types';

const instance = axios.create({
  baseURL: process.env.STRAPI_ADMIN_BACKEND_URL,
});

instance.interceptors.request.use(
  async (config: ToBeFixed) => {
    config.headers = {
      Authorization: `Bearer ${auth.getToken()}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    return config;
  },
  (error: ToBeFixed) => {
    Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response: ToBeFixed) => response,
  (error: ToBeFixed) => {
    if (error.response?.status === 401) {
      auth.clearAppStorage();
      window.location.reload();
    }

    throw error;
  }
);

export default instance;