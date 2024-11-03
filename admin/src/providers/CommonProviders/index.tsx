import { darkTheme, DesignSystemProvider, lightTheme } from '@strapi/design-system';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FC, ReactNode } from "react";

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
      <DesignSystemProvider theme={{theme: darkTheme, themeName: 'light'}}>
        {children}
      </DesignSystemProvider>
    </QueryClientProvider>
  )
};