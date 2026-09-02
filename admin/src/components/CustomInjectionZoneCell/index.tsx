import { useStrapiApp } from '@strapi/strapi/admin';
import { Td, Th } from '@strapi/design-system';

type CustomInjectionZoneCellProps = {
  area: `${string}.${string}.${string}`;
  as: 'th' | 'td';
  [key: string]: unknown;
};

export const CustomInjectionZoneCell = ({ area, as, ...props }: CustomInjectionZoneCellProps) => {
  const getPlugin = useStrapiApp('CustomInjectionZoneCell', (state) => state.getPlugin);
  const [pluginName, view, zone] = area.split('.');

  const plugin = getPlugin(pluginName);
  const components = plugin?.getInjectedComponents(view, zone);

  if (!components?.length) {
    return null;
  }

  const Cell = as === 'th' ? Th : Td;

  return components.map(({ name, Component }) => (
    <Cell key={name}>
      <Component {...props} />
    </Cell>
  ));
};
