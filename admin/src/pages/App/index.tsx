import { Layouts } from '@strapi/strapi/admin';
import { Navigate, Route, Routes } from 'react-router-dom';
import { SideNav } from '../../components/SideNav';
import { useConfig } from '../../hooks/useConfig';
import { CommonProviders } from '../../providers/CommonProviders';
import { useSettingsStore } from '../../store/settings.store';
import { Details } from '../Details';
import { Discover } from '../Discover';
import { Reports } from '../Reports';


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
        <Route path="/discover/:id" element={<Details config={config} />} />
        <Route path="/reports" element={<Reports config={config} />} />
        <Route path="*" element={<Navigate to="discover" replace />} />
      </Routes>
    </Layouts.Root>
  );
};

const App = () => {
  return (
    <CommonProviders>
      <InnerApp />
    </CommonProviders>
  );
};

export default App;
