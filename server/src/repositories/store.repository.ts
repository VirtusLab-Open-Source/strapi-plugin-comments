import { Core } from '@strapi/strapi';
import { once } from 'lodash';
import { REGEX } from '../const';
import { Either, makeRight } from '../utils/Either';
import { CommentsPluginConfig } from '../validators';

export const getStoreRepository = once((strapi: Core.Strapi) => {
  const pluginSelector = 'plugin::comments';

  return {
    getLocalConfig<P extends keyof CommentsPluginConfig>(
      prop: P,
      defaultValue?: CommentsPluginConfig[P],
    ) {
      console.log('strapi.config.get()', strapi.config.get(pluginSelector));
      return strapi.config.get([pluginSelector, prop].join('.'), defaultValue);
    },
    async getStore() {
      return await strapi.store({ type: 'plugin', name: 'comments' });
    },
    async get<T extends boolean>(
      viaSettingsPage?: T,
    ): Promise<
      Either<unknown, T extends true ? CommentsPluginConfig : Omit<CommentsPluginConfig, 'enabledCollections' | 'moderatorRoles' | 'isGQLPluginEnabled'>>
    > {
      const pluginStore = await this.getStore();
      const config = (await pluginStore.get({ key: 'config' })) as Required<CommentsPluginConfig>;
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
      await pluginStore.set({ key: 'config', value: config });
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
