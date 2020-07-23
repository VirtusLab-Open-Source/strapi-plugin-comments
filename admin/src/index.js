import pluginPkg from '../../package.json';
import pluginId from './pluginId';
import pluginPermissions from './permissions';
import pluginLogo from './assets/images/logo.svg';
import App from './containers/App';
import Initializer from './containers/Initializer';
import lifecycles from './lifecycles';
import trads from './translations';

export default strapi => {
  const pluginDescription = pluginPkg.strapi.description || pluginPkg.description;

  const icon = pluginPkg.strapi.icon;
  const name = pluginPkg.strapi.name;
  const plugin = {
    blockerComponent: null,
    blockerComponentProps: {},
    description: pluginDescription,
    icon,
    id: pluginId,
    initializer: Initializer,
    injectedComponents: [],
    isReady: false,
    isRequired: pluginPkg.strapi.required || false,
    layout: null,
    lifecycles,
    mainComponent: App,
    name,
    pluginLogo,
    preventComponentRendering: false,
    trads,
    menu: {
      pluginsSectionLinks: [
        {
          destination: `/plugins/${pluginId}`,
          icon,
          name,
          label: {
            id: `${pluginId}.plugin.name`,
            defaultMessage: 'COMMENTS',
          },
          permissions: pluginPermissions.main,
        },
      ],
    },
  };

  return strapi.registerPlugin(plugin);
};
