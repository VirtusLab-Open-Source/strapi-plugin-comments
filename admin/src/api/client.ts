import { getFetchClient } from '@strapi/strapi/admin';
import { once } from 'lodash';

const URL_PREFIX = 'comments';

export type ApiClient = ReturnType<typeof getApiClient>;

export const getApiClient = once((fetch: ReturnType<typeof getFetchClient>) => ({
  getIndexPrefix() {
    return [URL_PREFIX];
  },

  readAll() {
    return fetch.get(`/${URL_PREFIX}`);
  },
  readAllIndex() {
    return [URL_PREFIX, 'navigations'];
  },

  delete(documentId: string) {
    return fetch.del(`/${URL_PREFIX}/${documentId}`);
  },

  create(body: any) {
    return fetch.post(`/${URL_PREFIX}/`, body);
  },

  update(body: any) {
    return fetch.put(`/${URL_PREFIX}/${body.documentId}`, body);
  },

  purge({ documentId, withLangVersions }: { documentId?: string; withLangVersions?: boolean }) {
    return fetch.del(
      `/${URL_PREFIX}/cache/purge/${documentId ?? ''}?clearLocalisations=${!!withLangVersions}`
    );
  },

  slugify(query: string) {
    const queryParams = new URLSearchParams();

    queryParams.append('q', query);

    return fetch
      .get(`/${URL_PREFIX}/slug?${queryParams.toString()}`)
      .then(({ slug }: any) => slug);
  },

  readConfig() {
    return fetch
      .get(`/${URL_PREFIX}/config`)
  },
  readConfigIndex() {
    return [URL_PREFIX, 'config'];
  },

  readNavigationItemFromLocale({
    source,
    structureId,
    target,
    documentId,
  }: {
    source: string;
    target: string;
    documentId: string;
    structureId: string;
  }) {
    return fetch.get(
      `/${URL_PREFIX}/i18n/item/read/${documentId}/${source}/${target}?path=${structureId}`
    );
  },

  updateConfig(
    body: any
  ) {
    return fetch.put(`/${URL_PREFIX}/config`, body).then(() => {});
  },

  restart() {
    return fetch.get(`/${URL_PREFIX}/settings/restart`).then(() => {});
  },

  restoreConfig() {
    return fetch.del(`/${URL_PREFIX}/config`).then(() => {});
  },
  readSettingsConfig() {
    return fetch.get(`/${URL_PREFIX}/moderate/config`).then(({ data }) => {

      return {
        ...data,
        contentTypes: data.contentTypes.map(({ uid }: any) => uid),
      };
    });
  },
  readSettingsConfigIndex() {
    return [URL_PREFIX, 'config'];
  },

  readContentType() {
    return fetch
      .get(`/content-manager/content-types`)
  },
  readContentTypeIndex() {
    return [URL_PREFIX, 'content-manager', 'content-types'];
  },

  readContentTypeItems({ uid, locale, query }: { uid: string; locale?: string; query?: string }) {
    const queryParams = new URLSearchParams();

    if (query) {
      queryParams.append('_q', query);
    }

    if (locale) {
      queryParams.append('locale', locale);
    }

    return fetch
      .get(`/${URL_PREFIX}/content-type-items/${uid}?${queryParams.toString()}`)
  },
  readContentTypeItemsIndex({
    uid,
    locale,
    query,
  }: {
    uid: string;
    locale?: string;
    query?: string;
  }) {
    return [URL_PREFIX, 'content-manager', 'content-type-items', uid, locale, query];
  },

  readLocale() {
    return fetch
      .get(`/${URL_PREFIX}/settings/locale`)
  },
  readLocaleIndex() {
    return [URL_PREFIX, 'locale'];
  },

  copyNavigationLocale({
    documentId,
    source,
    target,
  }: {
    source: string;
    target: string;
    documentId: string;
  }) {
    return fetch.put(`/${URL_PREFIX}/i18n/copy/${documentId}/${source}/${target}`);
  },

  copyNavigationItemLocale({
    source,
    structureId = '',
    target,
  }: {
    source: string;
    target: string;
    structureId?: string;
  }) {
    return fetch
      .get(`/${URL_PREFIX}/i18n/item/read/${source}/${target}?path=${structureId}`)
  },
}));
