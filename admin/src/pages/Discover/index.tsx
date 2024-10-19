import { Table, Tbody, Th, Thead, Tr } from '@strapi/design-system';
import { Layouts, Page, Pagination, SearchInput, useNotification, useQueryParams, useRBAC, useTracking } from '@strapi/strapi/admin';
import { FC, useMemo } from 'react';
import { noop } from 'lodash';
import { Config } from '../../api/schemas';
import { CommentRow } from '../../components/CommentRow';
import { useCommentsAll } from '../../hooks/useCommentsAll';
import pluginPermissions from '../../permissions';


export const Discover: FC<{ config: Config }> = ({ config }) => {
  const { trackUsage } = useTracking();
  const { toggleNotification } = useNotification();
  const [{ query: queryParams }] = useQueryParams();
  const _q = (queryParams as any)?._q || '';

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
    data: { result, pagination },
    isFetching,
  } = useCommentsAll();

  return (
    <>
      <Page.Title children={'Comments - discover'} />
      <Page.Main>
        <Layouts.Header
          title="Discover threads"
          subtitle={`${pagination.total} entries found`}
          as="h2"
        />
        <Layouts.Action startActions={<SearchInput label="Search" />} />
        <Layouts.Content>
          <Table>
            <Thead>
              <Tr>
                <Th>Id</Th>
                <Th>Author</Th>
                <Th>Message</Th>
                <Th>Thread of</Th>
                <Th>Entry</Th>
                <Th>Last update</Th>
                <Th>Status</Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody>
              {result.map((comment) => (
                // TODO: permissions
                <CommentRow
                  key={comment.id}
                  item={comment}
                  canModerate={true}
                  canAccessReports={true}
                />
              ))}
            </Tbody>
          </Table>
          <Pagination.Root pageCount={pagination.pageCount} total={pagination.total} onPageSizeChange={noop}>
            <Pagination.PageSize />
            <Pagination.Links />
          </Pagination.Root>
        </Layouts.Content>
      </Page.Main>
    </>
  );
};

