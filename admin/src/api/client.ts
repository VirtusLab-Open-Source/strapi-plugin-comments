import { getFetchClient } from '@strapi/strapi/admin';
import { isEmpty, once } from 'lodash';
import { stringify } from 'qs';
import { commentDetailsSchema, commentsSchema, configSchema, contentTypeSchema } from './schemas';

const URL_PREFIX = 'comments';

export type ApiClient = ReturnType<typeof getApiClient>;

export const getApiClient = once((fetch: ReturnType<typeof getFetchClient>) => ({
  getConfigKey() {
    return [URL_PREFIX, 'config'];
  },
  async getSettingsConfiguration() {
    const response = await fetch.get(`/${URL_PREFIX}/settings/config`);
    return configSchema.parseAsync(response.data);
  },
  async getComments() {
    const response = await fetch.get(`/${URL_PREFIX}/moderate/all`);
    return commentsSchema.parseAsync(response.data);
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
  async getDetailsComment(id: number | string, filters: any) {
    const queryFilters = !isEmpty(filters) ? `?${stringify(filters, { encode: false })}` : '';
    const response = await fetch.get(`/${URL_PREFIX}/moderate/single/${id}${queryFilters}`);
    return commentDetailsSchema.parseAsync(response.data).catch((error) => {
      console.log('error', error);
      throw error;
    });
  },
  getDetailsCommentKey(id: number | string, canAccess: boolean, filters: any) {
    return [URL_PREFIX, 'details', canAccess, id, JSON.stringify(filters)];
  },
  async getContentTypeData(uid: string) {
    const response = await fetch.get(`/content-type-builder/content-types/${uid}`);
    return contentTypeSchema.parseAsync(response.data).then((data) => data.data);
  },
  getAdditionalDataKey(uid: string, canAccess: boolean) {
    return [URL_PREFIX, 'moderate', 'content-type', canAccess, uid];
  },
}));
