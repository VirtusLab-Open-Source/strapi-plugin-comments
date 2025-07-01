import { DesignSystemProvider } from '@strapi/design-system';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FC, ReactNode } from 'react';
import { usePluginTheme } from '@sensinum/strapi-utils';
import { UserProvider } from '../../contexts/UserContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});
export const CommonProviders: FC<{ children: ReactNode }> = ({ children }) => {

  const theme = usePluginTheme();
  return (
    <QueryClientProvider client={queryClient}>
      <DesignSystemProvider theme={{ theme }}>
        <UserProvider>
          {children}
        </UserProvider>
      </DesignSystemProvider>
    </QueryClientProvider>
  );
};
