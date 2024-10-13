// import { usePluginTheme } from '@sensinum/strapi-utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useConfig } from '../../hooks/useConfig';

const queryClient = new QueryClient();
const InnerApp = () => {
  const data = useConfig();
  console.log('data', data);
  return (
    <div>Test</div>
  );
};

const App = () => {

  return (
    <QueryClientProvider client={queryClient}>
      <InnerApp />
    </QueryClientProvider>
  );

  //
  // const {isLoading, isFetching} = useQuery(
  //   'get-config',
  //   () => fetchConfig(toggleNotification),
  //   {
  //     initialData: {},
  //     onSuccess: (response) => {
  //       setConfig(response);
  //     },
  //   },
  // );
  //
  // if (isLoading || isFetching) {
  //   return <LoadingIndicatorPage />;
  // }
  //
  // return (
  //   <div>
  //     <Switch>
  //       <Route path={getUrl('discover/:id')} component={Details} />
  //       <Route path={getUrl('dashboard')} component={ComingSoonPage} />
  //       <Route path={getUrl('discover')} component={Discover} />
  //       <Route path={getUrl('settings')} component={ComingSoonPage} />
  //       <Route path={getUrl('reports')} component={Reports} />
  //       <Route
  //         path={getUrl()}
  //         exact
  //         children={<Redirect to={getUrl('discover')} />}
  //       />
  //     </Switch>
  //   </div>
  // );
};

export default App;
