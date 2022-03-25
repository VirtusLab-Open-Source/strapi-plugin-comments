/**
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

// @ts-nocheck
import React from "react";
import { connect } from "react-redux";
import { bindActionCreators, compose } from "redux";
import { Switch, Route } from "react-router-dom";
import { useQuery } from "react-query";
import {
  NotFound,
  LoadingIndicatorPage,
  useNotification,
} from "@strapi/helper-plugin";

import ComingSoonPage from "../ComingSoonPage";
import getUrl from "../../utils/getUrl";
import Discover from "../Discover";
import Details from "../Details";
import { fetchConfig } from "./utils/api";
import { setConfig } from "./reducer/actions";
import makeAppView from "./reducer/selectors";

const App = ({ setConfig }) => {
  const toggleNotification = useNotification();

  const { isLoading, isFetching } = useQuery(
    "get-config",
    () => fetchConfig(toggleNotification),
    {
      initialData: {},
      onSuccess: (response) => {
        setConfig(response);
      },
    }
  );

  if (isLoading || isFetching) {
    return <LoadingIndicatorPage />;
  }

  return (
    <div>
      <Switch>
        <Route path={getUrl("dashboard")} component={ComingSoonPage} exact />
        <Route path={getUrl("discover")} component={Discover} exact />
        <Route path={getUrl("discover/:id")} component={Details} exact />
        <Route path={getUrl("reports")} component={ComingSoonPage} exact />
        <Route path={getUrl("settings")} component={ComingSoonPage} exact />
        <Route component={NotFound} />
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
