import { useStrapiApp } from '@strapi/strapi/admin';

type CustomInjectionZoneProps = {
  area: `${string}.${string}.${string}`;
  [key: string]: unknown;
};

export const CustomInjectionZone = ({ area, ...props }: CustomInjectionZoneProps) => {
  const getPlugin = useStrapiApp('CustomInjectionZone', (state) => state.getPlugin);
  const [pluginName, view, zone] = area.split('.');

  const plugin = getPlugin(pluginName);
  const components = plugin?.getInjectedComponents(view, zone);

  if (!components?.length) {
    return null;
  }

  return components.map(({ name, Component }) => <Component key={name} {...props} />);
};
