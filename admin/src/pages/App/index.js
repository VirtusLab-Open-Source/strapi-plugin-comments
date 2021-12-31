/**
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { NotFound } from '@strapi/helper-plugin';
import ComingSoonPage from '../ComingSoonPage';
import getUrl from '../../utils/getUrl';
import Discover from '../Discover';
import Details from '../Details';


const App = () => {
  return (
    <div>
      <Switch>
        <Route path={ getUrl('dashboard') } component={ComingSoonPage} exact />
        <Route path={ getUrl('discover') } component={Discover} exact />
        <Route path={ getUrl('discover/:id') } component={Details} exact  />
        <Route path={ getUrl('reports') } component={ComingSoonPage} exact />
        <Route path={ getUrl('settings') } component={ComingSoonPage} exact />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
};

export default App;
