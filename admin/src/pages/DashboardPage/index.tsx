//@ts-nocheck

import {
    ActionLayout,
    ContentLayout,
    HeaderLayout,
    Layout,
} from '@strapi/design-system/Layout';
import React, {memo, useMemo, useRef, useState} from 'react';
import {Table, Tbody, Td, Th, Thead, Tr} from '@strapi/design-system/Table';
import {bindActionCreators, compose} from 'redux';

import {Box} from '@strapi/design-system/Box';
import LatestComments from './components/LatestComments';
import LatestReports from './components/LatestReports';
import Nav from '../../components/Nav';
import { StyledBox } from './styles';
import {Typography} from '@strapi/design-system/Typography';
import {connect} from 'react-redux';
import isEqual from 'react-fast-compare';
import makeAppView from '../App/reducer/selectors';
import QuickActions from './components/QuickActions/QuickActoins';
import { fetchReportsData } from '../Reports/utils/api';
import { useQuery } from 'react-query';
import {
  useNotification,
  useQueryParams,
  useRBAC,
} from "@strapi/helper-plugin";
import pluginPermissions from "../../permissions";
import { getMessage } from '../../utils';


const DashboardPage = ({ config }) => {

  const toggleNotification = useNotification();
  const [{ query: queryParams }] = useQueryParams();

  const viewPermissions = useMemo(
    () => ({
      access: pluginPermissions.access,
      moderate: pluginPermissions.moderate,
      accessReports: pluginPermissions.reports,
      reviewReports: pluginPermissions.reportsReview,
    }),
    [],
  );

  const {
    isLoading: isLoadingForPermissions,
    allowedActions: {
      canAccess,
      canModerate,
      canAccessReports,
      canReviewReports,
    },
  } = useRBAC(viewPermissions);

  const allowedActions = {
    canAccess,
    canModerate,
    canAccessReports,
    canReviewReports,
  };

  const {
    isLoading: isLoadingForData,
    data: { result, pagination = {} },
    isFetching,
  } = useQuery(
    ["get-reports-data", queryParams, canAccess],
    () => fetchReportsData(queryParams, toggleNotification),
    {
      initialData: {},
    },
  );

  const toResolve = result ? result.filter(report => report.resolved === false) : null;

  const emptyLayoutReports = {
    comments: {
      id: getMessage("page.reports.table.empty"),
      defaultMessage: "You don't have any reports yet.",
    },
    search: {
      id: getMessage("page.reports.table.empty.search"),
      defaultMessage: "No reports match the search.",
    },
  };

  const emptyLayoutActions = {
    comments: {
      id: getMessage("page.reports.table.empty"),
      defaultMessage: "You don't have any reports to resolve.",
    },
    search: {
      id: getMessage("page.reports.table.empty.search"),
      defaultMessage: "No reports match the search.",
    },
  };
      
    return (
      <Box background="neutral100">
          <Layout sideNav={<Nav visible />}>
                <HeaderLayout
                title="Dashboard Page"
                as="h1"
                />
              <ContentLayout>
                  <LatestReports 
                    config={config}
                    header='Reports to Resolve'
                    result={toResolve}
                    isLoadingForData={isLoadingForData}
                    isFetching={isFetching}
                    pagination={pagination}
                    allowedActions={allowedActions}
                    isLoadingForPermissions={isLoadingForPermissions}
                    emptyLayout={emptyLayoutActions} />
                  <LatestComments config={config} />
                  <LatestReports 
                    config={config}
                    header='Latest Reports'
                    result={result}
                    isLoadingForData={isLoadingForData}
                    isFetching={isFetching}
                    pagination={pagination}
                    allowedActions={allowedActions}
                    isLoadingForPermissions={isLoadingForPermissions}
                    emptyLayout={emptyLayoutReports}
                  />
              </ContentLayout>
          </Layout>
      </Box>
    )
}

const mapStateToProps = makeAppView();

export function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch);
}
const withConnect = connect(mapStateToProps, mapDispatchToProps);

export default compose(withConnect)(memo(DashboardPage, isEqual));