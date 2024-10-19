import { Button, Checkbox, Table, Tbody, Th, Thead, Tr, Typography } from '@strapi/design-system';
import { Check } from '@strapi/icons';
import { useNotification } from '@strapi/strapi/admin';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { FC } from 'react';
import { useIntl } from 'react-intl';
import { Report } from '../../api/schemas';
import { useAPI } from '../../hooks/useAPI';
import { AllowedActions } from '../../types';
import { getMessage } from '../../utils';
import { ReportReasonBadge } from '../ReportReasonBadge';
import { ReportStatusBadge } from '../ReportStatusBadge';

type Props = {
  commentId: number;
  reports: Report[];
  selectedItems: number[];
  allowedActions: AllowedActions;
  onBlockButtonsStateChange: (disabled: boolean) => void;
  onSelectionChange: (items: number[]) => void;
};
export const ReportReviewTable: FC<Props> = ({
  commentId,
  reports,
  selectedItems,
  allowedActions: { canAccessReports, canReviewReports },
  onBlockButtonsStateChange,
  onSelectionChange,
}) => {
  const { formatDate } = useIntl();
  const api = useAPI();
  const queryClient = useQueryClient();
  const { toggleNotification } = useNotification();


  const resolveReportMutation = useMutation({
    mutationKey: ['resolveReport', commentId],
    mutationFn: api.resolveReport,
  });

  const onCheckAll = (checked: boolean) => {
    onSelectionChange(checked ? reports.map((report) => report.id) : []);
  };

  const onCheckItemChange = (report: Report) =>
    (checked: boolean) => {
      if (checked) {
        onSelectionChange([...selectedItems, report.id]);
      } else {
        onSelectionChange(selectedItems.filter((id) => id !== report.id));
      }
    };

  const onClickResolve = (reportId: number) => async () => {
    try {
      await resolveReportMutation.mutateAsync({ id: commentId, reportId });
      await queryClient.invalidateQueries({
        queryKey: api.getCommentsKey(),
      });
      // TODO
      // toggleNotification('success', 'notification.success');
    } catch (error) {
      // toggleNotification('error', 'notification.error');
    }
  };

  // if (canAccessReports) {
  const isAllChecked = selectedItems.length > 0 ? selectedItems.length === reports.length ? true : 'indeterminate' : false;
  return (
    <Table>
      <Thead>
        <Tr>
          <Th>
            <Checkbox
              checked={isAllChecked}
              onCheckedChange={onCheckAll}
              disabled={reports.filter((report) => !report.resolved).length === 0}
            />
          </Th>
          <Th>
            <Typography variant="sigma">
              Reason
            </Typography>
          </Th>
          <Th>
            <Typography variant="sigma">
              Content
            </Typography>
          </Th>
          <Th>
            <Typography variant="sigma">
              CreateAt
            </Typography>
          </Th>
          <Th>
            <Typography variant="sigma">
              Status
            </Typography>
          </Th>
          <Th />
        </Tr>
      </Thead>
      <Tbody>
        {reports.map((report) => {
          return (
            <Tr key={report.id}>
              <Th>
                <Checkbox
                  checked={selectedItems.includes(report.id)}
                  onCheckedChange={onCheckItemChange(report)}
                  disabled={report.resolved}
                />
              </Th>
              <Th>
                <ReportReasonBadge reason={report.reason} />
              </Th>
              <Th>{report.content}</Th>
              <Th>{
                formatDate(report.createdAt, {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </Th>
              <Th>
                <ReportStatusBadge resolved={report.resolved} />
              </Th>
              <Th>
                {!report.resolved && (
                  <Button
                    variant="success"
                    startIcon={<Check />}
                    onClick={onClickResolve(report.id)}
                  >
                    {getMessage(
                      'page.details.panel.discussion.warnings.reports.dialog.actions.resolve',
                      'Resolve',
                    )}
                  </Button>
                )}
              </Th>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
  // }
  // return null;
};