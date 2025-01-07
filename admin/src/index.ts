import { flattenObject, prefixPluginTranslations } from '@sensinum/strapi-utils';
import * as pluginPkg from '../../package.json';
import PluginIcon from './components/PluginIcon';
import pluginPermissions from './permissions';
import { pluginId } from './pluginId';
import trads from './translations';

const { name, displayName } = pluginPkg.strapi;

export default {
  register(app: any) {
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      badgeContent: 1,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: displayName,
      },
      Component: () => import('./pages/App'),
      permissions: pluginPermissions.access,
    });

    app.createSettingSection(
      {
        id: pluginId,
        intlLabel: {
          id: `${pluginId}.plugin.section`,
          defaultMessage: `${displayName} plugin`,
        },
      },
      [
        {
          intlLabel: {
            id: `${pluginId}.plugin.section.item`,
            defaultMessage: 'Configuration',
          },
          id: 'comments',
          to: `/settings/${pluginId}`,
          Component: () => import('./pages/Settings'),
          permissions: pluginPermissions.settings,
        },
      ],
    );
  },

  registerTrads: async function ({ locales = [] }: { locales: string[] }) {
    return Promise.all(
      locales.map(async (locale: string) => {
        if (locale in trads) {
          const typedLocale = locale as keyof typeof trads;
          return trads[typedLocale]().then(({ default: trad }) => {
            return {
              data: prefixPluginTranslations(flattenObject(trad), pluginId),
              locale,
            };
          });
        }
        return {
          data: prefixPluginTranslations(flattenObject({}), pluginId),
          locale,
        };
      }),
    );
  },
};
