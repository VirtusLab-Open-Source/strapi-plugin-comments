// @ts-ignore
import { prefixPluginTranslations } from "@strapi/helper-plugin";
import { get } from 'lodash';
import { StrapiAdminInstance } from "strapi-typed";
import * as pluginPkg from "../../package.json";
import { pluginId } from "./pluginId";
import Initializer from "./components/Initializer";
import PluginIcon from "./components/PluginIcon";
import pluginPermissions from "./permissions";
import reducers from "./reducers";
import { registerCustomFields } from "./custom-fields";
import trads, { TranslationKey, Translations } from "./translations";

const { name, displayName } = pluginPkg.strapi;

export default {
  register(app: StrapiAdminInstance) {
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      badgeContent: 1,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: displayName,
      },
      Component: async () => {
        const component = await import(
          /* webpackChunkName: "[request]" */ './pages/App'
        );

        return component;
      },
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
            defaultMessage: "Configuration",
          },
          id: "comments",
          to: `/settings/${pluginId}`,
          Component: async () => {
            const component = await import(
              /* webpackChunkName: "documentation-settings" */ "./pages/Settings"
            );

            return component;
          },
          permissions: pluginPermissions.settings,
        },
      ]
    );

    app.addReducers(reducers);
    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name,
    });

    registerCustomFields(app);
  },

  registerTrads({ locales = [] }: { locales: Array<TranslationKey>}) {
    return locales
    .filter((locale: string) => Object.keys(trads).includes(locale))
    .map((locale: string) => {
      return {
        data: prefixPluginTranslations(get<Translations, TranslationKey>(trads, locale as TranslationKey, trads.en), pluginId, {}),
        locale,
      };
    });
  },
};
