//@ts-nocheck

import React, {memo, useRef, useMemo} from 'react';
import {useQuery} from 'react-query';
import {useHistory} from 'react-router-dom';
import {useNotifyAT} from '@strapi/design-system/LiveRegions';
import {isEmpty} from 'lodash';
import isEqual from "react-fast-compare";
import {fetchData} from '../Discover/utils/api';
import pluginPermissions from '../../permissions';
import getUrl from '../../utils/getUrl';
import getMessage from '../../utils/getMessage';
import makeAppView from "../App/reducer/selectors";
import { connect } from "react-redux";
import { bindActionCreators, compose } from "redux";
import {
    EmptyStateLayout,
    SearchURLQuery,
    LoadingIndicatorPage,
    useTracking,
    useNotification,
    useRBAC,
    useFocusWhenNavigate,
    useQueryParams,
  } from '@strapi/helper-plugin';
import {Box} from '@strapi/design-system/Box';
import {
    Layout,
    HeaderLayout,
    ActionLayout,
    ContentLayout,
  } from '@strapi/design-system/Layout';
import {Table, Thead, Tbody, Tr, Th, Td} from '@strapi/design-system/Table';
import {Typography} from '@strapi/design-system/Typography';
import {VisuallyHidden} from '@strapi/design-system/VisuallyHidden';
import DiscoverTableRow from '../Discover/components/DiscoverTableRow';
import Nav from '../../components/Nav';
import LatestComments from './components/LatestComments';

const DashboardPage = ({config}) => {

    useFocusWhenNavigate();

    const {push} = useHistory();
    const {notifyStatus} = useNotifyAT();
    const {trackUsage} = useTracking();
    const trackUsageRef = useRef(trackUsage);
    const toggleNotification = useNotification();
    const [{query: queryParams}] = useQueryParams();
    const _q = queryParams?._q || '';
  
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

    const {
        isLoading: isLoadingForData,
        data: {result, pagination = {}},
        isFetching,
      } = useQuery(
        ['get-data', queryParams, canAccess],
        () => fetchData(queryParams, toggleNotification),
        {
          initialData: {},
        },
      );

    const isLoading = isLoadingForData || isFetching;

    const handleClickDisplay = (id) => {
        push(getUrl(`discover/${id}`));
      };

    const emptyLayout = {
        comments: {
          id: getMessage('page.discover.table.empty'),
          defaultMessage: "You don't have any comments yet.",
        },
        search: {
          id: getMessage('page.discover.table.empty.search'),
          defaultMessage: 'No comments match the search.',
        },
      };
    
    const emptyContent = _q ? 'search' : 'comments';

    return ( 
        <Box background="neutral100">
        <Layout>
          {isLoading || isLoadingForPermissions ? (
            <LoadingIndicatorPage />
          ) : (
            <Layout sideNav={<Nav visible />}>
              <HeaderLayout
                  title="Dashboard Page"
                  as="h2"
                />
                <ContentLayout>
                  {!isEmpty(result) ? (
                    <LatestComments
                      data={result}
                      handleClick={() => handleClickDisplay(entry.id)} 
                      config={config} 
                      allowedActions={{
                        canModerate,
                        canAccessReports,
                        canReviewReports,
                    }}/>
                  ) : (
                    <EmptyStateLayout content={emptyLayout[emptyContent]} />
                  )}
                </ContentLayout>
            </Layout>
          )}
        </Layout>
      </Box>
  ) 
};
 
const mapStateToProps = makeAppView();

export function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch);
}
const withConnect = connect(mapStateToProps, mapDispatchToProps);

export default compose(withConnect)(memo(DashboardPage, isEqual));