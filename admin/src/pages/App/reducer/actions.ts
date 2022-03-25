// @ts-nocheck

import { GET_CONFIG, SET_CONFIG } from "./constants";

export const setConfig = (data) => ({
  data,
  type: SET_CONFIG,
});

export const getConfig = () => ({ type: GET_CONFIG });
