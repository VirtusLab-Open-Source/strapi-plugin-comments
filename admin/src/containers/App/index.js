/**
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import React,  { Suspense, lazy }from 'react';
import { Switch, Route } from 'react-router-dom';
import { NotFound, LoadingIndicatorPage } from 'strapi-helper-plugin';
import Wrapper from './Wrapper';
// Utils
import pluginId from '../../pluginId';
import DataManagerProvider from '../DataManagerProvider';
// Containers


const Panel = lazy(() => import('../Panel'));

const App = () => {
  return (
    <Wrapper>
      <DataManagerProvider>
        <Suspense fallback={<LoadingIndicatorPage />}>
          <Switch>
            <Route
              path={`/plugins/${pluginId}`}
              component={Panel}
              exact
            />
            <Route
              path={`/plugins/${pluginId}/display/:id`}
              component={Panel}
              exact
            />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </DataManagerProvider>
    </Wrapper>
  );
};

export default App;
