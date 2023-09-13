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
import { styledLayout } from './styles';
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
import getMessage from '../../../../utils/getMessage';
import { fetchData, displayComment } from '../../../Discover/utils/api';
import pluginPermissions from '../../../../permissions';

import getUrl from '../../../../utils/getUrl';
import makeAppView from '../../../App/reducer/selectors';
import DiscoverTableRow from '../../../Discover/components/DiscoverTableRow';
import NoAcccessPage from '../../../NoAccessPage';
import { PanelLayout, StyledHeader } from '../../styles';

const COL_COUNT = 8;

const LatestComments = ({ config }) => {
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
    ['get-comments-data', queryParams, canAccess],
    () => fetchData(queryParams, toggleNotification),
    {
      initialData: {},
    },
  );

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

  const unreadedComments = result ? result.filter(entity => entity.displayedBy.length === 0).length : null;

  const subtitle = <Typography variant='omega' fontSize='20px'>You have {unreadedComments} unreaded comments</Typography>;

  return canAccess ? (
        <Layout>
          {isLoading || isLoadingForPermissions ? (
            <LoadingIndicatorPage />
          ) : (
            <>
              <PanelLayout>
                <StyledHeader>
                <Typography variant='beta' fontSize='30px'>Latest Comments</Typography>
                <br/>
                {subtitle}
                </StyledHeader>
                  {!isEmpty(result) ? (
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
                          {result.slice(0, 5).map((entry) => (
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
                  ) : (
                    <EmptyStateLayout content={emptyLayout[emptyContent]} />
                  )}
                </PanelLayout>
            </>
          )}
        </Layout>
  ) :
    <NoAcccessPage />

};
 
export default LatestComments;
