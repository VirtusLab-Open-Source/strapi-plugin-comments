import { Button, Checkbox, Flex, Table, Tbody, Th, Thead, Tr, Typography } from '@strapi/design-system';
import { Check } from '@strapi/icons';
import { Layouts, Page, Pagination, SearchInput, useNotification, useQueryParams } from '@strapi/strapi/admin';
import { useQueryClient } from '@tanstack/react-query';
import React, { FC, useCallback, useState } from 'react';
import { Config } from '../../api/schemas';
import { ReportsTableRow } from '../../components/ReportsTableRow';
import { SortableTh } from '../../components/SortableTh';
import { useAPI } from '../../hooks/useAPI';
import { useCommentMutations } from '../../hooks/useCommentMutations';
import { useReports } from '../../hooks/useReports';
import { getMessage } from '../../utils';

const tableHeaders = [
  { label: "page.reports.table.header.id" },
  { label: "page.reports.table.header.reason" },
  { label: "page.reports.table.header.content", orderBy: "content" },
  { label: "page.reports.table.header.status" },
  { label: "page.reports.table.header.issueDate", orderBy: "updatedAt" },
  { label: "page.reports.table.header.relatedComment" },
  { label: "page.reports.table.header.actions" },
];

export const Reports: FC<{ config: Config }> = ({ config }) => {
  const { toggleNotification } = useNotification();
  const api = useAPI();
  const [{ query: queryParams }] = useQueryParams();
  const [selectedItems, setSelectedItems] = useState<Array<number>>([]);
  const { reportMutation } = useCommentMutations();
  const queryClient = useQueryClient();


  const { data: { result, pagination } } = useReports(queryParams as Record<string, string>);
  const isAllChecked = selectedItems.length > 0 ? selectedItems.length === result.length ? true : 'indeterminate' : false;
  const onCheckAll = (checked: boolean) => {
    setSelectedItems(checked ? result.map((report) => report.id) : []);
  };

  const onCheck = useCallback((id: number) => {
      setSelectedItems(prevState => {
        return prevState.includes(id)
          ? prevState.filter((item) => item !== id)
          : [...prevState, id];
      });
    }
    , []);

  const handleClickResolveSelected = async () => {
    await reportMutation.resolveMultiple.mutateAsync({
      reportIds: selectedItems,
    });
    await queryClient.invalidateQueries({
      exact: false,
      queryKey: api.reports.findAll.getKey(),
    });
    setSelectedItems([]);
  };

  return (
    <>
      <Page.Title children={'Comments - reports'} />
      <Page.Main>
        <Layouts.Header
          title={getMessage('page.reports.header', 'Resolved reports')}
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
        <Layouts.Action startActions={(
          <Flex gap="2">
            <SearchInput label={getMessage('common.search', "Search")} />
            {selectedItems.length > 0 && (
              <Button
                variant="success"
                onClick={handleClickResolveSelected}
                startIcon={<Check />}
              >
                {getMessage(
                  {
                    id: `page.details.panel.discussion.warnings.reports.dialog.actions.resolve.selected`,
                    props: {
                      count: selectedItems.length,
                    },
                  },
                  'Resolve selected',
                )}
              </Button>
            )}
          </Flex>
        )} />
        <Layouts.Content>
          <Table>
            <Thead>
              <Tr>
                <Th>
                  <Checkbox
                    checked={isAllChecked}
                    onCheckedChange={onCheckAll}
                    disabled={result.filter((report) => !report.resolved).length === 0}
                  />
                </Th>
                {tableHeaders.map(({ label, orderBy }) => (
                  <>
                    {!orderBy ? (
                      <Th>
                        <Typography variant="sigma">
                          {getMessage(label)}
                        </Typography>
                      </Th>
                    ) : (
                      <SortableTh
                        label={getMessage(label)}
                        orderByKey={orderBy}
                      />
                    )}
                  </>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {result.map((entry) => {
                return (
                  <ReportsTableRow
                    key={entry.id}
                    item={entry}
                    isChecked={selectedItems.includes(entry.id)}
                    onSelectionChange={onCheck}
                  />
                );
              })}
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