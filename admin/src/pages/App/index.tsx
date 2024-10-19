import { DesignSystemProvider } from '@strapi/design-system';
import { Layouts } from '@strapi/strapi/admin';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navigate, Route, Routes } from 'react-router-dom';
import { SideNav } from '../../components/SideNav';
import { useConfig } from '../../hooks/useConfig';
import { useSettingsStore } from '../../store/settings.store';
import { Details } from '../Details';
import { Discover } from '../Discover';
import { Reports } from '../Reports';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});
const InnerApp = () => {
  const setSettings = useSettingsStore(state => state.setSettings);
  const { isLoading, data: config } = useConfig(setSettings);
  if (isLoading || !config) {
    return <div>Loading...</div>;
  }
  return (
    <Layouts.Root sideNav={<SideNav />}>
      <Routes>
        <Route path="/discover" element={<Discover config={config} />} />
        <Route path="/discover/:id" element={<Details />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="*" element={<Navigate to="discover" replace />} />
      </Routes>
    </Layouts.Root>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <DesignSystemProvider>
        <InnerApp />
      </DesignSystemProvider>
    </QueryClientProvider>
  );
};

export default App;
