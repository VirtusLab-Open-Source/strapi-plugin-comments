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
  blockComment(id: number) {
    return fetch.put(`/${URL_PREFIX}/moderate/single/${id}/block`);
  },
  unblockComment(id: number) {
    return fetch.put(`/${URL_PREFIX}/moderate/single/${id}/unblock`);
  },
  blockThread(id: number) {
    return fetch.put(`/${URL_PREFIX}/moderate/thread/${id}/block`);
  },
  resolveReport({ id, reportId }: { id: number, reportId: number }) {
    return fetch.put(`/${URL_PREFIX}/moderate/single/${id}/report/${reportId}/resolve`);
  },
  resolveMultipleReports({ id, reportIds }: { id: number, reportIds: number[] }) {
    return fetch.put(`/${URL_PREFIX}/moderate/single/${id}/report/resolve`, { reportIds });
  },
  resolveAllAbuseReportsForComment(id: number) {
    return fetch.put(`/${URL_PREFIX}/moderate/all/${id}/report/resolve`);
  },
  resolveAllAbuseReportsForThread(id: number) {
    return fetch.put(`/${URL_PREFIX}/moderate/thread/${id}/report/resolve-thread`);
  },
}));
