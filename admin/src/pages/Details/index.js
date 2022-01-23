/*
 *
 * Details
 *
 */

import React, { memo, useRef, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import isEqual from 'react-fast-compare';
import { useQuery } from 'react-query';
import { useRouteMatch } from 'react-router-dom';
import { Layout, HeaderLayout, TwoColsLayout, ContentLayout } from '@strapi/design-system/Layout';
import { Box } from '@strapi/design-system/Box';
import { Flex } from '@strapi/design-system/Flex';
import { Link } from '@strapi/design-system/Link';
import { Loader } from '@strapi/design-system/Loader';
import { Stack } from '@strapi/design-system/Stack';
import { useNotifyAT } from '@strapi/design-system/LiveRegions';
import { ArrowLeft } from '@strapi/icons';

import { isEmpty } from 'lodash';
import {
  LoadingIndicatorPage,
  useTracking,
  useNotification,
  useRBAC,
  useFocusWhenNavigate,
} from '@strapi/helper-plugin';
import getMessage from '../../utils/getMessage';
import { fetchDetailsData, fetchContentTypeData } from '../utils/api';
import pluginPermissions from '../../permissions';
import { getUrl } from '../../utils';
import Nav from '../../components/Nav';
import DetailsEntity from './components/DetailsEntity';
import DiscussionThread from '../../components/DiscussionThread';
import DiscussionStatus from '../../components/DiscussionStatus';
import makeAppView from '../App/reducer/selectors';
import DetailsFilters from './components/DetailsFilters';

const Details = ({ config }) => {
  useFocusWhenNavigate();

  const {
    params: { id },
  } = useRouteMatch(getUrl(`discover/:id`));

  const { notifyStatus } = useNotifyAT();
  const { trackUsage } = useTracking();
  const trackUsageRef = useRef(trackUsage);
  const toggleNotification = useNotification();

  const viewPermissions = useMemo(() => {
    return { view: pluginPermissions.view };
  }, []);

  const {
    isLoading: isLoadingForPermissions,
    allowedActions: { canView },
  } = useRBAC(viewPermissions);

  const [filters, setFilters] = useState({});

  const regexUID = new RegExp(config.regex.uid);

  const { isLoading: isLoadingForData, data, isFetching } = useQuery(
    ['get-details-data', id, filters],
    () => fetchDetailsData(id, filters, toggleNotification),
    {
      initialData: { },
    }
  );

  const { entity, level, selected } = data;
  const entityUidValid = entity?.uid && regexUID.test(entity.uid);

  const { data: contentTypeData } = useQuery(
    ['get-additional-data', entity?.uid],
    () => fetchContentTypeData(entity?.uid, toggleNotification),
    {
      enabled: !!entity?.uid, 
      suspense: !entityUidValid,
    }
  )

  const handleChangeFilters = props => setFilters(props);

  const isLoading = isLoadingForData || isFetching;

  return <Box background="neutral100">
          <Layout>
            {(isLoading || isLoadingForPermissions) && isEmpty(data) ? (<LoadingIndicatorPage />) : (
            <>
              <HeaderLayout 
                navigationAction={
                <Link startIcon={<ArrowLeft />} to={getUrl(`discover`)}>
                  { getMessage('HeaderLayout.link.go-back', 'Back', false) }
                </Link>}
                title={ getMessage('page.details.header') } 
                subtitle={ getMessage('page.details.header.description') } 
                primaryAction={<DetailsFilters data={filters} onChange={handleChangeFilters} />}
                secondaryAction={<Box as={Flex}>&nbsp;</Box>}
                as="h2" />
              <ContentLayout>
                <TwoColsLayout 
                  startCol={<DiscussionThread level={level} selected={selected} isReloading={isLoading} />} 
                  endCol={ <Stack size={2}>
                    <DiscussionStatus item={selected} />
                    { !contentTypeData?.schema ? (<Box padding={4}>
                        <Loader small>{ getMessage('page.details.panel.loading', 'Loading...') }</Loader>
                      </Box>) : 
                      (<DetailsEntity data={entity} schema={contentTypeData?.schema} config={config} />)
                    }
                  </Stack>
                  } 
                />
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

export default compose(withConnect)(memo(Details, isEqual));