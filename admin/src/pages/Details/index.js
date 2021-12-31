/*
 *
 * Details
 *
 */

import React, { useRef, useMemo } from 'react';
import { useQuery } from 'react-query';
import { useRouteMatch } from 'react-router-dom';
import { Layout, HeaderLayout, TwoColsLayout, ContentLayout } from '@strapi/design-system/Layout';
import { Box } from '@strapi/design-system/Box';
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
import { fetchDetailsData, fetchContentTypeData } from './utils/api';
import pluginPermissions from '../../permissions';
import { getUrl } from '../../utils';
import Nav from '../../components/Nav';
import { REGEX } from '../../utils/constants';
import EntityDetails from '../../components/EntityDetails';
import DiscussionThread from '../../components/DiscussionThread';
import DiscussionStatus from '../../components/DiscussionStatus';

const Details = () => {
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

  const { isLoading: isLoadingForData, data, isFetching } = useQuery(
    ['get-details-data', id],
    () => fetchDetailsData(id, toggleNotification),
    {
      initialData: { },
    }
  );

  const { entity, level, selected } = data;
  const entityUidValid = entity?.uid && REGEX.uid.test(entity?.uid);

  const { data: contentTypeData } = useQuery(
    ['get-additional-data', entity?.uid],
    () => fetchContentTypeData(entity?.uid, toggleNotification),
    {
      enabled: !!entity?.uid, 
      suspense: !entityUidValid,
    }
  )

  const isLoading = isLoadingForData || isFetching;

  return <Box background="neutral100">
          <Layout sideNav={<Nav />}>
            {(isLoading || isLoadingForPermissions) && isEmpty(data) ? (<LoadingIndicatorPage />) : (
            <>
              <HeaderLayout 
                navigationAction={
                <Link startIcon={<ArrowLeft />} to={getUrl(`discover`)}>
                  { getMessage('button.back.label', '', false) }
                </Link>}
                title={ getMessage('page.details.header') } 
                subtitle={ getMessage('page.details.header.description') } as="h2" />
              <ContentLayout>
                <TwoColsLayout 
                  startCol={<DiscussionThread level={level} selected={selected} isReloading={isLoading} />} 
                  endCol={ <Stack size={2}>
                    <DiscussionStatus item={selected} />
                    { !contentTypeData?.schema ? (<Box padding={4}>
                        <Loader small>Fetching entity...</Loader>
                      </Box>) : 
                      (<EntityDetails data={entity} schema={contentTypeData?.schema} />)
                    }
                  </Stack>
                  } 
                />
              </ContentLayout>
            </>) }
          </Layout>
        </Box>;
}

export default Details;
