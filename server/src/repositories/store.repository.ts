import { Core } from '@strapi/strapi';
import { once } from 'lodash';
import { PLUGIN_SELECTOR, REGEX, REPORT_REASON } from '../const';
import { Either, makeRight } from '../utils/Either';
import { CommentsPluginConfig } from '../validators/api/controllers/settings.controller.validator';

export const getStoreRepository = once((strapi: Core.Strapi) => {
  return {
    getLocalConfig<P extends keyof CommentsPluginConfig>(
      prop?: P,
      defaultValue?: CommentsPluginConfig[P],
    ) {
      return strapi.config.get([PLUGIN_SELECTOR, prop].filter(Boolean).join('.'), defaultValue);
    },
    async getStore() {
      return await strapi.store({ type: 'plugin', name: 'comments' });
    },
    async getConfig(): Promise<Required<CommentsPluginConfig>> {
      const store = await this.getStore();
      return await store.get({ key: 'config' }) as Promise<Required<CommentsPluginConfig>>;
    },
    async get<T extends boolean>(
      viaSettingsPage?: T,
    ): Promise<
      Either<unknown, T extends true ? CommentsPluginConfig : Omit<CommentsPluginConfig, 'enabledCollections' | 'moderatorRoles' | 'isGQLPluginEnabled'>>
    > {
      const config = await this.getConfig();
      const additionalConfiguration = {
        regex: Object.keys(REGEX).reduce(
          (prev, curr) => {
            return ({
              ...prev,
              [curr]: REGEX[curr as keyof typeof REGEX].toString(),
            });
          },
          {} as Record<keyof typeof REGEX, string>,
        ),
      };
      const isGQLPluginEnabled = !!strapi.plugin('graphql');
      if (config) {
        return makeRight({
          ...config,
          ...additionalConfiguration,
          isGQLPluginEnabled: viaSettingsPage ? isGQLPluginEnabled : undefined,
        });
      }
      const entryLabel = this.getLocalConfig('entryLabel');
      const approvalFlow = this.getLocalConfig('approvalFlow');
      const reportReasons = this.getLocalConfig('reportReasons');
      const blockedAuthorProps = this.getLocalConfig('blockedAuthorProps');

      const result = {
        entryLabel,
        approvalFlow,
        blockedAuthorProps,
        reportReasons,
        ...additionalConfiguration,
      };

      if (viaSettingsPage) {
        const enabledCollections = this.getLocalConfig('enabledCollections');
        const moderatorRoles = this.getLocalConfig('moderatorRoles');
        return makeRight({
          ...result,
          enabledCollections,
          moderatorRoles,
          isGQLPluginEnabled,
        });
      }

      return makeRight(result) as unknown as Either<unknown, T extends true ? CommentsPluginConfig : Omit<CommentsPluginConfig, 'enabledCollections' | 'moderatorRoles' | 'isGQLPluginEnabled'>>;
    },
    async update(config: CommentsPluginConfig) {
      const pluginStore = await this.getStore();
      await pluginStore.set({
        key: 'config',
        value: {
          ...config,
          reportReasons: {
            BAD_LANGUAGE: REPORT_REASON.BAD_LANGUAGE,
            DISCRIMINATION: REPORT_REASON.DISCRIMINATION,
            OTHER: REPORT_REASON.OTHER,
          },
        },
      });
      return this.get();
    },
    async restore() {
      const pluginStore = await this.getStore();
      await pluginStore.delete({ key: 'config' });
      return this.get();
    },
  };
});

export type StoreRepository = ReturnType<typeof getStoreRepository>;
