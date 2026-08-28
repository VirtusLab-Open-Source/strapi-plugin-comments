import { useStrapiApp } from '@strapi/strapi/admin';
import { ComponentType, ReactNode } from 'react';

type ProviderComponentProps = {
  children: ReactNode;
  [key: string]: unknown;
};

type CustomInjectionZoneProviderProps = {
  area: `${string}.${string}.${string}`;
  children: ReactNode;
  [key: string]: unknown;
};

export const CustomInjectionZoneProvider = ({
  area,
  children,
  ...props
}: CustomInjectionZoneProviderProps) => {
  const getPlugin = useStrapiApp('CustomInjectionZoneProvider', (state) => state.getPlugin);
  const [pluginName, view, zone] = area.split('.');

  const plugin = getPlugin(pluginName);
  const components = plugin?.getInjectedComponents(view, zone);

  if (!components?.length) {
    return children;
  }

  return components.reduceRight((acc, { name, Component }) => {
    const Provider = Component as ComponentType<ProviderComponentProps>;

    return (
      <Provider key={name} {...props}>
        {acc}
      </Provider>
    );
  }, children);
};
