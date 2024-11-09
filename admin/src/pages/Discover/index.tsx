import { Table, Tbody, Th, Thead, Tr } from '@strapi/design-system';
import { Layouts, Page, Pagination, SearchInput, useNotification, useQueryParams, useTracking } from '@strapi/strapi/admin';
import { FC } from 'react';
import { Config } from '../../api/schemas';
import { CommentRow } from '../../components/CommentRow';
import { useCommentsAll } from '../../hooks/useCommentsAll';
import { getMessage } from '../../utils';


export const Discover: FC<{ config: Config }> = ({ config }) => {
  const { trackUsage } = useTracking();
  const { toggleNotification } = useNotification();
  const [{ query: queryParams }] = useQueryParams();

  const { data: { result, pagination } } = useCommentsAll(queryParams as Record<string, string>);

  return (
    <>
      <Page.Title children={'Comments - discover'} />
      <Page.Main>
        <Layouts.Header
          title={getMessage('page.discover.header')}
          subtitle={`${pagination.total} entries found`}
          as="h2"
        />
        <Layouts.Action startActions={<SearchInput label="Search" />} />
        <Layouts.Content>
          <Table>
            <Thead>
              <Tr>
                <Th>
                  {getMessage('page.discover.table.header.id')}
                </Th>
                <Th>
                  {getMessage('page.discover.table.header.author')}
                </Th>
                <Th>
                  {getMessage('page.discover.table.header.message')}
                </Th>
                <Th>
                  {getMessage('page.discover.table.header.thread')}
                </Th>
                <Th>
                  {getMessage('page.discover.table.header.entry')}
                </Th>
                <Th>
                  {getMessage('page.discover.table.header.lastUpdate')}
                </Th>
                <Th>
                  {getMessage('page.discover.table.header.status')}
                </Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody>
              {result.map((comment) => (
                <CommentRow
                  key={comment.id}
                  item={comment}
                />
              ))}
            </Tbody>
          </Table>
          <Pagination.Root pageCount={pagination.pageCount} total={pagination.total}>
            <Pagination.PageSize />
            <Pagination.Links />
          </Pagination.Root>
        </Layouts.Content>
      </Page.Main>
    </>
  );
};

