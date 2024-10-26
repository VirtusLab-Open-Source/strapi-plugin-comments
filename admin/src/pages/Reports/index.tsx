import { Checkbox, Table, Tbody, Th, Thead, Tr, Typography } from '@strapi/design-system';
import { Layouts, Page, SearchInput, useNotification, useQueryParams } from '@strapi/strapi/admin';
import { useQueryClient } from '@tanstack/react-query';
import React, { FC, useCallback, useState } from 'react';
import { Config } from '../../api/schemas';
import { ReportsTableRow } from '../../components/ReportsTableRow';
import { usePermissions } from '../../hooks/usePermissions';
import { useReports } from '../../hooks/useReports';
import { getMessage } from '../../utils';

const tableHeaders = [
  'page.reports.table.header.id',
  'page.reports.table.header.reason',
  'page.reports.table.header.content',
  'page.reports.table.header.status',
  'page.reports.table.header.issueDate',
  'page.reports.table.header.relatedComment',
  'page.reports.table.header.actions',
];


export const Reports: FC<{ config: Config }> = ({ config }) => {
  const { toggleNotification } = useNotification();
  const [{ query: queryParams }] = useQueryParams();
  const [selectedItems, setSelectedItems] = useState<Array<number>>([]);

  const _q = (queryParams as any)?._q || '';
  const queryClient = useQueryClient();
  const {
    canAccess,
    canModerate,
    canAccessReports,
    canReviewReports,
  } = usePermissions();

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

  return (
    <>
      <Page.Title children={'Comments - reports'} />
      <Page.Main>
        <Layouts.Header
          title="Resolve threads"
          subtitle={`${pagination.total} entries found`}
          as="h2"
        />
        <Layouts.Action startActions={<SearchInput label="Search" />} />
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
                {tableHeaders.map((title) => (
                  <Th>
                    <Typography variant="sigma">
                      {getMessage(title)}
                    </Typography>
                  </Th>
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
        </Layouts.Content>
      </Page.Main>
    </>
  );
};