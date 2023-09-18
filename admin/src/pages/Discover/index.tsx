/*
 *
 * Discover
 *
 */

// TODO
// @ts-nocheck

import React, {memo, useRef, useMemo} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators, compose} from 'redux';
import isEqual from 'react-fast-compare';
import {useQuery} from 'react-query';
import {useHistory} from 'react-router-dom';
import {isEmpty} from 'lodash';
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
import {useNotifyAT} from '@strapi/design-system/LiveRegions';
import {Grid} from '@strapi/design-system/Grid';

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
import getMessage from '../../utils/getMessage';
import {fetchData, displayComment} from './utils/api';
import pluginPermissions from '../../permissions';

import getUrl from '../../utils/getUrl';
import Nav from '../../components/Nav';
import TablePagination from '../../components/TablePagination';
import filtersSchema from './utils/filtersSchema';
import TableFilters from '../../components/TableFilters';
import makeAppView from '../App/reducer/selectors';
import DiscoverTableRow from './components/DiscoverTableRow';
import NoAcccessPage from '../NoAccessPage';

const COL_COUNT = 8;

const Discover = ({config}) => {
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

  console.log(result);

  const handleClickDisplay = (id) => {
    push(getUrl(`discover/${id}`));
    displayComment(id);
  };

  const isLoading = isLoadingForData || isFetching;
  const {total} = pagination;

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



  return canAccess ? (
      <Box background="neutral100">
        <Layout>
          {isLoading || isLoadingForPermissions ? (
            <LoadingIndicatorPage />
          ) : (
            <Layout sideNav={<Nav visible />}>
              <>
                <HeaderLayout
                  title={getMessage("page.discover.header")}
                  subtitle={`${total} ${getMessage(
                    "page.discover.header.count",
                  )}`}
                  as="h2"
                />
                <ActionLayout
                  startActions={
                    <>
                      <SearchURLQuery
                        label={getMessage("search.label", "Search", false)}
                      />
                      <TableFilters displayedFilters={filtersSchema} />
                    </>
                  }
                />
                <ContentLayout>
                  {!isEmpty(result) ? (
                    <>
                      <Table colCount={COL_COUNT} rowCount={result.length}>
                        <Thead>
                          <Tr>
                            <Th>
                              <Typography variant="sigma">
                                {getMessage("page.discover.table.header.id")}
                              </Typography>
                            </Th>
                            <Th>
                              <Typography variant="sigma">
                                {getMessage(
                                  "page.discover.table.header.author",
                                )}
                              </Typography>
                            </Th>
                            <Th>
                              <Typography variant="sigma">
                                {getMessage(
                                  "page.discover.table.header.message",
                                )}
                              </Typography>
                            </Th>
                            <Th>
                              <Typography variant="sigma">
                                {getMessage(
                                  "page.discover.table.header.thread",
                                )}
                              </Typography>
                            </Th>
                            <Th>
                              <Typography variant="sigma">
                                {getMessage("page.discover.table.header.entry")}
                              </Typography>
                            </Th>
                            <Th>
                              <Typography variant="sigma">
                                {getMessage(
                                  "page.discover.table.header.lastUpdate",
                                )}
                              </Typography>
                            </Th>
                            <Th>
                              <Typography variant="sigma">
                                {getMessage(
                                  "page.discover.table.header.status",
                                )}
                              </Typography>
                            </Th>
                            <Th>
                              <VisuallyHidden>
                                {getMessage(
                                  "page.discover.table.header.actions",
                                )}
                              </VisuallyHidden>
                            </Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {result.map((entry) => (
                            <DiscoverTableRow
                              key={`comment-${entry.id}`}
                              config={config}
                              item={entry}
                              allowedActions={{
                                canModerate,
                                canAccessReports,
                                canReviewReports,
                              }}
                              onClick={() => handleClickDisplay(entry.id)}
                            />
                          ))}
                        </Tbody>
                      </Table>
                      <TablePagination
                        pagination={{ pageCount: pagination?.pageCount || 1 }}
                      />
                    </>
                  ) : (
                    <EmptyStateLayout content={emptyLayout[emptyContent]} />
                  )}
                </ContentLayout>
              </>
            </Layout>
          )}
        </Layout>
      </Box>
  ) :
    <NoAcccessPage />

};

const mapStateToProps = makeAppView();

export function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch);
}
const withConnect = connect(mapStateToProps, mapDispatchToProps);

export default compose(withConnect)(memo(Discover, isEqual));
