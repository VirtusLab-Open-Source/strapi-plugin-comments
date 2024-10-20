import { Table, Tbody, Th, Thead, Tr } from '@strapi/design-system';
import { Layouts, Page, Pagination, SearchInput, useNotification, useQueryParams, useTracking } from '@strapi/strapi/admin';
import { noop } from 'lodash';
import { FC } from 'react';
import { Config } from '../../api/schemas';
import { CommentRow } from '../../components/CommentRow';
import { useCommentsAll } from '../../hooks/useCommentsAll';
import { usePermissions } from '../../hooks/usePermissions';


export const Discover: FC<{ config: Config }> = ({ config }) => {
  const { trackUsage } = useTracking();
  const { toggleNotification } = useNotification();
  const [{ query: queryParams }] = useQueryParams();
  const _q = (queryParams as any)?._q || '';

  const {
    isLoadingForPermissions,
    canAccess,
    canModerate,
    canAccessReports,
    canReviewReports,
  } = usePermissions();


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
                <CommentRow
                  key={comment.id}
                  item={comment}
                  canModerate={canModerate}
                  canAccessReports={canAccessReports}
                  canReviewReports={canReviewReports}
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

