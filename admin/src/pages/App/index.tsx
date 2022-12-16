/**
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

// TODO
// @ts-nocheck
import React from "react";
import { connect } from "react-redux";
import { bindActionCreators, compose } from "redux";
import {Switch, Route, Redirect} from 'react-router-dom';
import {useQuery} from 'react-query';
import {
  NotFound,
  LoadingIndicatorPage,
  useNotification,
} from '@strapi/helper-plugin';

//import ComingSoonPage from '../ComingSoonPage'; 
import getUrl from '../../utils/getUrl';
import Discover from '../Discover';
import Details from '../Details';
import Reports from '../Reports';
import {fetchConfig} from './utils/api';
import {setConfig} from './reducer/actions';
import makeAppView from './reducer/selectors';
import DashboardPage from '../DashboardPage';
import ComingSoonPage from "../ComingSoonPage";

const App = ({setConfig}) => {
  const toggleNotification = useNotification();

  const {isLoading, isFetching} = useQuery(
    'get-config',
    () => fetchConfig(toggleNotification),
    {
      initialData: {},
      onSuccess: (response) => {
        setConfig(response);
      },
    },
  );

  if (isLoading || isFetching) {
    return <LoadingIndicatorPage />;
  }

  return (
    <div>
      <Switch>
        <Route path={getUrl('discover/:id')} component={Details} />
        <Route path={getUrl('dashboard')} component={DashboardPage} />
        <Route path={getUrl('discover')} component={Discover} />
        <Route path={getUrl('settings')} component={ComingSoonPage} />
        <Route path={getUrl('reports')} component={Reports} />
        <Route
          path={getUrl()}
          exact
          children={<Redirect to={getUrl('discover')} />}
        />
      </Switch>
    </div>
  );
};

const mapStateToProps = makeAppView();

export function mapDispatchToProps(dispatch) {
  return bindActionCreators({ setConfig }, dispatch);
}
const withConnect = connect(mapStateToProps, mapDispatchToProps);

export default compose(withConnect)(App);
