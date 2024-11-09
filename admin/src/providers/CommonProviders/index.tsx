import { darkTheme, DesignSystemProvider, lightTheme } from '@strapi/design-system';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FC, ReactNode } from 'react';
import { UserProvider } from '../../contexts/UserContext';

console.log('!!darkTheme', !!darkTheme);
console.log('!!lightTheme', !!lightTheme);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});
export const CommonProviders: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <DesignSystemProvider theme={{ theme: darkTheme, themeName: 'light' }}>
        <UserProvider>
          {children}
        </UserProvider>
      </DesignSystemProvider>
    </QueryClientProvider>
  );
};
