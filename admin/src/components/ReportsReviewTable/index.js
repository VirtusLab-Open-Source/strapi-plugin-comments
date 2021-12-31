/**
 *
 * Entity Details
 *
 */

 import React, { useState, useEffect } from 'react';
 import { useIntl } from 'react-intl';
 import PropTypes from 'prop-types';
 import { isEmpty } from 'lodash';
 import { Badge } from '@strapi/design-system/Badge'; 
 import { Button } from '@strapi/design-system/Button'; 
 import { BaseCheckbox } from '@strapi/design-system/BaseCheckbox'; 
 import { Flex } from '@strapi/design-system/Flex'; 
 import { Table, Thead, Tbody, TFooter, Tr, Th, Td } from '@strapi/design-system/Table'; 
 import { Typography } from '@strapi/design-system/Typography'; 
 import { VisuallyHidden } from '@strapi/design-system/VisuallyHidden'; 
 import { Check } from '@strapi/icons';
import { useOverlayBlocker } from '@strapi/helper-plugin';
import { getMessage } from '../../utils';
import { REPORT_REASON, REPORT_STATUS } from '../../utils/constants';

const ReportsReviewTable = ({ 
    commentId,
    items,
    mutation
}) => {

    const [storedItems, setStoredItems] = useState([]);

    const { formatDate } = useIntl();

    const { lockApp } = useOverlayBlocker();

    const renderStatus = resolved => {
        const status = resolved ? REPORT_STATUS.RESOLVED : REPORT_STATUS.OPEN;
        let color = 'alternative';
        switch (status) {
            case REPORT_STATUS.RESOLVED:
                color = 'success';
                break;
            case REPORT_STATUS.OPEN:
                color = 'danger';
        };
        return (<Badge backgroundColor={`${color}100`} textColor={`${color}600`}>{ getMessage(`page.details.panel.discussion.warnings.reports.dialog.status.${status}`, status) }</Badge>);
    };

    const renderReason = reason => {
        let color = 'neutral';
        switch (reason) {
            case REPORT_REASON.DISCRIMINATION:
                color = 'danger';
                break;
            case REPORT_REASON.BAD_LANGUAGE:
                color = 'warning';
        };
        return (<Badge backgroundColor={`${color}100`} textColor={`${color}600`}>{ getMessage(`page.details.panel.discussion.warnings.reports.dialog.reason.${reason}`, reason) }</Badge>);
    };

    const handleClickResolve = async (reportId) => {
        lockApp();
        const item = await mutation.mutateAsync({
            id: commentId,
            reportId,
        });
        console.log(item);
        if (item) {
            setStoredItems(storedItems.map(_ => ({
                ..._,
                resolved: reportId === _.id ? true : _.resolved,
            })));
        }
    }

    useEffect(() => {
        setStoredItems(items);
    }, []);

    if (isEmpty(storedItems)) {
        return null;
    }

    const COL_COUNT = 6;

    return (<Table colCount={COL_COUNT} rowCount={storedItems.length}>
        <Thead>
          <Tr>
            <Th>
              <BaseCheckbox aria-label="Select all entries" />
            </Th>
            <Th>
              <Typography variant="sigma">{ getMessage('page.details.panel.discussion.warnings.reports.dialog.reason') }</Typography>
            </Th>
            <Th>
              <Typography variant="sigma">{ getMessage('page.details.panel.discussion.warnings.reports.dialog.content') }</Typography>
            </Th>
            <Th>
              <Typography variant="sigma">{ getMessage('page.details.panel.discussion.warnings.reports.dialog.createdAt') }</Typography>
            </Th>
            <Th>
              <Typography variant="sigma">{ getMessage('page.details.panel.discussion.warnings.reports.dialog.status') }</Typography>
            </Th>
            <Th>
              <VisuallyHidden>{ getMessage('page.details.panel.discussion.warnings.reports.dialog.actions') }</VisuallyHidden>
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {storedItems.map(entry => <Tr key={entry.id}>
              <Td>
                <BaseCheckbox aria-label={`Select report`} />
              </Td>
              <Td>
                <Typography textColor="neutral800">{renderReason(entry.reason)}</Typography>
              </Td>
              <Td>
                <Typography textColor="neutral800">{entry.content}</Typography>
              </Td>
              <Td>
                <Typography textColor="neutral800">{ formatDate(entry.createdAt, { dateStyle: 'short', timeStyle: 'short' }) }</Typography>
              </Td>
              <Td>
                <Typography textColor="neutral800">{ renderStatus(entry.resolved) }</Typography>
              </Td>
              <Td>
                  { !entry.resolved && (<Flex direction="column" alignItems="flex-end">
                        <Button onClick={() => handleClickResolve(entry.id)} startIcon={<Check />} variant="success">{ getMessage('page.details.panel.discussion.warnings.reports.dialog.actions.resolve', 'resolve') }</Button>
                    </Flex>) }
              </Td>
            </Tr>)}
        </Tbody>
        {/* <TFooter /> */}
      </Table>)
};

ReportsReviewTable.propTypes = {
    commentId: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired,
    mutation: PropTypes.func.isRequired,
};

  export default ReportsReviewTable;