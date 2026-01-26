import { Box, Grid } from '@strapi/design-system';
import { Layouts, Page } from '@strapi/strapi/admin';
import { useQuery } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Config } from '../../api/schemas';
import { useAPI } from '../../hooks/useAPI';
import { usePermissions } from '../../hooks/usePermissions';
import { parseRegExp, getMessage } from '../../utils';
import { DetailsEntry } from './DetailsEntry';
import { DiscussionThread } from './DiscussionThread';


export const Details: FC<{ config: Config }> = ({ config }) => {
  const api = useAPI();
  const { id } = useParams<{ id: string }>();
  const [filters, setFilters] = useState({});
  const {
    canAccess,
    canModerate,
    canAccessReports,
    canReviewReports,
  } = usePermissions();
  const regexUID = new RegExp(
    parseRegExp(config.regex.uid).value,
    parseRegExp(config.regex.uid).flags,
  );

  const { data: { entity, level, selected }, isLoading: isLoadingForData, isFetching } = useQuery({
    queryKey: api.comments.findOne.getKey(id!, filters),
    queryFn: () => api.comments.findOne.query(id!, filters),
    initialData: {
      level: [],
      selected: {} as any,
      entity: {} as any,
    },
  });

  const entityUidValid = entity?.uid && regexUID.test(entity.uid);

  const { data: contentTypeData } = useQuery({
    queryKey: api.contentTypeBuilder.single.getKey(entity?.uid, canAccess),
    queryFn: () => api.contentTypeBuilder.single.query(entity?.uid),
    enabled: !!entityUidValid,
  });

  if (!entity.uid) {
    return (
      <Box>
        <Page.Title children={'Comments - details'} />
        <Page.Main>
          <Layouts.Header
            title={getMessage('page.details.header')}
            subtitle={getMessage('page.details.header.description.empty')}
            as="h2"
          />
        </Page.Main>
      </Box>
    )
  }

  const isLoading = isLoadingForData || isFetching;

  if (!isLoading && canAccess) {
    return (
      <Box background="neutral100">
        <Page.Title children={'Comments - details'} />
        <Page.Main>
          <Layouts.Header
            title={getMessage('page.details.header')}
            subtitle={getMessage('page.details.header.description')}
            as="h2"
          />
          <Layouts.Content>
            <Grid.Root gap={4}>
              <Grid.Item col={9} s={12}>
                <DiscussionThread
                  level={level}
                  selected={selected}
                  isReloading={isLoading}
                  allowedActions={{
                    canModerate,
                    canAccessReports,
                    canReviewReports,
                  }}
                />
              </Grid.Item>
              <Grid.Item col={3} s={12} alignItems="flex-start">
                <DetailsEntry
                  config={config}
                  entity={entity}
                  filters={filters}
                  onChangeFilters={setFilters}
                  schema={contentTypeData?.schema || ({ attributes: {} } as any)}
                />
              </Grid.Item>
            </Grid.Root>
          </Layouts.Content>
        </Page.Main>
      </Box>
    );
  }
  return null;
};