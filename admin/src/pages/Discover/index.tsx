import { Table, Tbody, Th, Thead, Tr } from '@strapi/design-system';
import { Layouts, Page, Pagination, SearchInput, useQueryParams } from '@strapi/strapi/admin';
import { CommentRow } from '../../components/CommentRow';
import { CommentsStatusFilters } from '../../components/CommentStatusFilters';
import { SortableTh } from '../../components/SortableTh';
import { useCommentsAll } from '../../hooks/useCommentsAll';
import { getMessage } from '../../utils';

const tableHeaders = [
  { label: "page.discover.table.header.id" },
  { label: "page.discover.table.header.author", maxWidth: "200px" },
  { label: "page.discover.table.header.message", orderByKey: "content" },
  { label: "page.discover.table.header.thread", display: { initial: 'none', large : 'table-cell' } },
  { label: "page.discover.table.header.entry" },
  { label: "page.discover.table.header.lastUpdate", orderByKey: "updatedAt", display: { initial: 'none', large: 'table-cell' } },
  { label: "page.discover.table.header.status" },
];

export const Discover = () => {
  const [{ query: queryParams }] = useQueryParams();

  const { data: { result, pagination } } = useCommentsAll(queryParams as Record<string, string>);

  return (
    <>
      <Page.Title children={'Comments - discover'} />
      <Page.Main>
        <Layouts.Header
          title={getMessage('page.discover.header')}
          subtitle={getMessage(
            {
              id: `page.discover.header.count`,
              props: {
                count: pagination.total,
              },
            },
            `${pagination.total} entries found`
          )}
          as="h2"
        />
        <Layouts.Action startActions={
          <>
            <SearchInput label={getMessage('common.search', "Search")} />
            <CommentsStatusFilters />
          </>
        }/>
        <Layouts.Content>
          <Table>
            <Thead>
              <Tr>
                {tableHeaders.map((header) => (
                  <SortableTh key={header.label} {...header} />
                ))}
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

