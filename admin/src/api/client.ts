import { getFetchClient } from '@strapi/strapi/admin';
import { once } from 'lodash';
import { commentsSchema, configSchema } from './schemas';

const URL_PREFIX = 'comments';

export type ApiClient = ReturnType<typeof getApiClient>;

export const getApiClient = once((fetch: ReturnType<typeof getFetchClient>) => ({
  getConfigKey() {
    return [URL_PREFIX, 'config'];
  },
  async getSettingsConfiguration() {
    const response = await fetch.get(`/${URL_PREFIX}/settings/config`);
    return configSchema.parse(response.data);
  },
  async getComments() {
    const response = await fetch.get(`/${URL_PREFIX}/moderate/all`);
    return commentsSchema.parse(response.data);
  },
  getCommentsKey() {
    return [URL_PREFIX, 'moderate', 'all'];
  },
  approveComment(id: number) {
    return fetch.put(`/${URL_PREFIX}/moderate/single/${id}/approve`);
  },
  rejectComment(id: number) {
    return fetch.put(`/${URL_PREFIX}/moderate/single/${id}/reject`);
  },
}));
