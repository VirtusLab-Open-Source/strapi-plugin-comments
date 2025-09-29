import { getFetchClient } from '@strapi/strapi/admin';
import { isEmpty, once } from 'lodash';
import { stringify } from 'qs';
import { commentDetailsSchema, commentsSchema, configSchema, contentTypeSchema, contentTypesSchema, reportsSchema, rolesListSchema, User, userSchema } from './schemas';

const URL_PREFIX = 'comments';

export type ApiClient = ReturnType<typeof getApiClient>;

export const getApiClient = once((fetch: ReturnType<typeof getFetchClient>) => ({
  config: {
    getKey() {
      return [URL_PREFIX, 'config'];
    },
    async query() {
      const response = await fetch.get(`/${URL_PREFIX}/settings/config`);
      return configSchema.parseAsync(response.data);
    },
  },
  contentTypeBuilder: {
    single: {
      getKey(uid: string, canAccess: boolean) {
        return [URL_PREFIX, 'moderate', 'content-type', canAccess, uid];
      },
      async query(uid: string) {
        const response = await fetch.get(`/content-type-builder/content-types/${uid}`);
        return contentTypeSchema.parseAsync(response.data).then((data) => data.data);
      },
    },
    all: {
      getKey() {
        return [URL_PREFIX, 'moderate', 'content-types'];
      },
      async query() {
        const response = await fetch.get('/content-type-builder/content-types');
        return contentTypesSchema.parseAsync(response.data).then((data) => data.data);
      },
    },
  },
  roles: {
    getKey() {
      return [URL_PREFIX, 'moderate', 'roles'];
    },
    async query() {
      const response = await fetch.get('/admin/roles');
      return rolesListSchema.parseAsync(response.data).then((data) => data.data);
    },
  },
  user: {
    getKey() {
      return [URL_PREFIX, 'moderate', 'user'];
    },
    async query() {
      const response = await fetch.get('/admin/users/me');
      return userSchema.parseAsync(response.data).then((data) => data.data);
    },
  },
  comments: {
    findAll: {
      getKey(queryParams?: Record<string, string>) {
        return [URL_PREFIX, 'moderate', 'all', queryParams ? JSON.stringify(queryParams) : undefined].filter(Boolean) as string[];
      },
      async query(queryParams: Record<string, string>) {
        const response = await fetch.get(`/${URL_PREFIX}/moderate/all?${stringify(queryParams, { encode: false })}`);
        return commentsSchema.parseAsync(response.data);
      },
    },
    findOne: {
      getKey(id?: number | string, filters?: any) {
        return [URL_PREFIX, 'details', id?.toString(), filters ? JSON.stringify(filters) : undefined].filter(Boolean) as string[];
      },
      async query(id: number | string, filters: any) {
        const queryFilters = !isEmpty(filters) ? `?${stringify(filters, { encode: false })}` : '';
        const response = await fetch.get(`/${URL_PREFIX}/moderate/single/${id}${queryFilters}`);
        return commentDetailsSchema.parseAsync(response.data);
      },
    },
    approve(id: number) {
      return fetch.put(`/${URL_PREFIX}/moderate/single/${id}/approve`);
    },
    reject(id: number) {
      return fetch.put(`/${URL_PREFIX}/moderate/single/${id}/reject`);
    },
    block(id: number) {
      return fetch.put(`/${URL_PREFIX}/moderate/single/${id}/block`);
    },
    unblock(id: number) {
      return fetch.put(`/${URL_PREFIX}/moderate/single/${id}/unblock`);
    },
    blockThread(id: number) {
      return fetch.put(`/${URL_PREFIX}/moderate/thread/${id}/block`);
    },
    unBlockThread(id: number) {
      return fetch.put(`/${URL_PREFIX}/moderate/thread/${id}/unblock`);
    },
    delete(id: number) {
      return fetch.del(`/${URL_PREFIX}/moderate/single/${id}/delete`);
    },
    postComment({ id, content, author }: { id: number | string, content: string, author: User }) {
      return fetch.post(`/${URL_PREFIX}/moderate/thread/${id}/postComment`, { content, author });
    },
    updateComment({ id, content }: { id: number | string, content: string }) {
      return fetch.put(`/${URL_PREFIX}/moderate/single/${id}/update`, { content });
    },
  },
  reports: {
    findAll: {
      getKey(queryParams?: Record<string, string>) {
        return [URL_PREFIX, 'moderate', 'reports', queryParams ? JSON.stringify(queryParams) : undefined].filter(Boolean) as string[];
      },
      async query(queryParams?: Record<string, string>) {
        const response = await fetch.get(`/${URL_PREFIX}/moderate/reports${queryParams ? `?${stringify(queryParams, { encode: false })}` : ''}`);
        return reportsSchema.parseAsync(response.data);
      },
    },
    resolve({ id, reportId }: { id: number, reportId: number }) {
      return fetch.put(`/${URL_PREFIX}/moderate/single/${id}/report/${reportId}/resolve`);
    },
    resolveMultipleReports({ reportIds }: { reportIds: number[] }) {
      return fetch.put(`/${URL_PREFIX}/moderate/multiple/report/resolve`, { reportIds });
    },
    resolveCommentMultipleReports({ id, reportIds }: { id: number, reportIds: number[] }) {
      return fetch.put(`/${URL_PREFIX}/moderate/single/${id}/report/resolve`, { reportIds });
    },
    resolveAllAbuseReportsForComment(id: number) {
      return fetch.put(`/${URL_PREFIX}/moderate/all/${id}/report/resolve`);
    },
    resolveAllAbuseReportsForThread(id: number) {
      return fetch.put(`/${URL_PREFIX}/moderate/thread/${id}/report/resolve-thread`);
    },
  },
  settings: {
    update(body: any) {
      return fetch.put(`/${URL_PREFIX}/settings/config`, body);
    },
    restore() {
      return fetch.del(`/${URL_PREFIX}/settings/config`);
    },
    restart() {
      return fetch.post(`/${URL_PREFIX}/settings/restart`);
    },
  },
}));
