/*
 *
 * Discover
 *
 */

import React, { memo, useRef, useMemo } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import isEqual from 'react-fast-compare';
import { useIntl } from 'react-intl';
import { useQuery } from 'react-query';
import { useHistory } from 'react-router-dom';
import { isEmpty } from 'lodash';
import { Badge } from '@strapi/design-system/Badge';
import { BaseCheckbox } from '@strapi/design-system/BaseCheckbox'; 
import { Box } from '@strapi/design-system/Box';
import { Flex } from '@strapi/design-system/Flex'; 
import { IconButton } from '@strapi/design-system/IconButton';
import { Layout, HeaderLayout, ActionLayout, ContentLayout } from '@strapi/design-system/Layout';
import { Table, Thead, Tbody, Tr, Th, Td } from '@strapi/design-system/Table'; 
import { Typography } from '@strapi/design-system/Typography'; 
import { VisuallyHidden } from '@strapi/design-system/VisuallyHidden'; 
import { useNotifyAT } from '@strapi/design-system/LiveRegions';
import { Eye } from '@strapi/icons';

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
import { fetchData } from './utils/api';
import pluginPermissions from '../../permissions';

import getUrl from '../../utils/getUrl';
import Nav from '../../components/Nav';
import { COMMENT_STATUS } from '../../utils/constants';
import TablePagination from '../../components/TablePagination';
import filtersSchema from './utils/filtersSchema';
import TableFilters from '../../components/TableFilters';
import appReducer from '../App/reducer';
import makeAppView, { selectConfig } from '../App/reducer/selectors';

const Discover = ({ config }) => {
  useFocusWhenNavigate();

  const { push } = useHistory();
  const { notifyStatus } = useNotifyAT();
  const { trackUsage } = useTracking();
  const trackUsageRef = useRef(trackUsage);
  const toggleNotification = useNotification();
  const { formatDate } = useIntl();
  const [{ query: queryParams }] = useQueryParams();
  const _q = queryParams?._q || '';

  const viewPermissions = useMemo(() => {
    return { view: pluginPermissions.view };
  }, []);

  const {
    isLoading: isLoadingForPermissions,
    allowedActions: { canView },
  } = useRBAC(viewPermissions);

  const { isLoading: isLoadingForData, data: { result, pagination = {} }, isFetching } = useQuery(
    ['get-providers', queryParams],
    () => fetchData(queryParams, toggleNotification),
    {
      initialData: { },
    }
  );

  const handleClickDisplay = id => {
    push(getUrl(`discover/${id}`));
  };

  const isLoading = isLoadingForData || isFetching;
  const { total } = pagination;

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

  const renderStatus = ({ blocked, blockedThread }) => {
    const status = blocked || blockedThread ? COMMENT_STATUS.BLOCKED : COMMENT_STATUS.OPEN;
    let color = 'secondary';
    switch (status) {
        case COMMENT_STATUS.OPEN:
            color = 'success';
            break;
        case COMMENT_STATUS.BLOCKED:
            color = 'danger';
    };
    return (<Badge backgroundColor={`${color}100`} textColor={`${color}600`}>{ getMessage(`page.discover.table.header.status.${status}`, status) }</Badge>);
  };

  const emptyContent = _q ? 'search' : 'comments';
  
  const COL_COUNT = 7;

  return <Box background="neutral100">
          <Layout sideNav={<Nav />}>
            {isLoading || isLoadingForPermissions ? (<LoadingIndicatorPage />) : (
            <>
              <HeaderLayout title={ getMessage('page.discover.header') } subtitle={ `${total} ${ getMessage('page.discover.header.count')}` } as="h2" />
              <ActionLayout 
                    startActions={<>
                      <SearchURLQuery
                        label={ getMessage('search.label', 'Search', false) }
                      />
                      <TableFilters displayedFilters={filtersSchema} />
                    </>} />
              <ContentLayout>
                { !isEmpty(result) ? (<>
                <Table colCount={COL_COUNT} rowCount={result.length}>
                  <Thead>
                    <Tr>
                      <Th>
                        <BaseCheckbox aria-label="Select all entries" />
                      </Th>
                      <Th>
                        <Typography variant="sigma">{ getMessage('page.discover.table.header.message') }</Typography>
                      </Th>
                      <Th>
                        <Typography variant="sigma">{ getMessage('page.discover.table.header.thread') }</Typography>
                      </Th>
                      <Th>
                        <Typography variant="sigma">{ getMessage('page.discover.table.header.entry') }</Typography>
                      </Th>
                      <Th>
                        <Typography variant="sigma">{ getMessage('page.discover.table.header.lastUpdate') }</Typography>
                      </Th>
                      <Th>
                        <Typography variant="sigma">{ getMessage('page.discover.table.header.status') }</Typography>
                      </Th>
                      <Th>
                        <VisuallyHidden>{ getMessage('page.discover.table.header.actions') }</VisuallyHidden>
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {result.map(entry => <Tr key={entry.id}>
                        <Td>
                          <BaseCheckbox aria-label={`Select ${entry.content}`} />
                        </Td>
                        <Td style={{ maxWidth: '40vw' }}>
                          <Typography textColor="neutral800" ellipsis>{entry.content}</Typography>
                        </Td>
                        <Td>
                          <Typography textColor="neutral800">{entry.threadOf?.id || '-'}</Typography>
                        </Td>
                        <Td>
                          <Typography textColor="neutral800">{entry.related?.id}</Typography>
                        </Td>
                        <Td>
                          <Typography textColor="neutral800">{ formatDate(entry.updatedAt || entry.createdAt, { dateStyle: 'long', timeStyle: 'short' }) }</Typography>
                        </Td>
                        <Td>
                          <Typography textColor="neutral800">{ renderStatus(entry) }</Typography>
                        </Td>
                        <Td>
                          <Flex direction="column" alignItems="flex-end">
                            <IconButton onClick={() => handleClickDisplay(entry.id)} label={ getMessage('page.discover.table.action.display') } icon={<Eye />} />
                          </Flex>
                        </Td>
                      </Tr>)}
                  </Tbody>
                </Table>
                <TablePagination pagination={{ pageCount: pagination?.pageCount || 1 }} />
                </>) : (<EmptyStateLayout content={emptyLayout[emptyContent]} />) }
              </ContentLayout>
            </>) }
          </Layout>
        </Box>;
}

const mapStateToProps = makeAppView();

export function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    { },
    dispatch
  );
}
const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps
);

export default compose(withConnect)(memo(Discover, isEqual));
