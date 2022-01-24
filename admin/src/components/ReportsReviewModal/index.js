/**
 *
 * Entity Details
 *
 */

 import React from 'react';
 import PropTypes from 'prop-types';
 import { ModalLayout, ModalBody, ModalHeader, ModalFooter } from '@strapi/design-system/ModalLayout';
 import { Typography } from '@strapi/design-system/Typography';
import { getMessage } from '../../utils';
import DiscussionThreadItem from '../DiscussionThreadItem';

const ReportsReviewModal = ({ 
    isVisible = false,
    item,
    children, 
    onClose, 
    startActions,
    endActions,
}) => ( isVisible && 
    (<ModalLayout onClose={onClose}>
        <ModalHeader>
            <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">{ getMessage('page.details.panel.discussion.warnings.reports.dialog.header', 'Open reports') }</Typography>
        </ModalHeader>
        <ModalBody>
            <DiscussionThreadItem {...item} root preview isSelected={false} />
            { children }
        </ModalBody>
        <ModalFooter variant="tertiary" startActions={startActions} endActions={endActions} />
    </ModalLayout>)
  );

  ReportsReviewModal.propTypes = {
    isVisible: PropTypes.bool,
    startActions: PropTypes.array,
    endActions: PropTypes.array,
    item: PropTypes.object.isRequired,
    children: PropTypes.array.isRequired,
    allowedActions: PropTypes.shape({
        canModerate: PropTypes.bool, 
        canAccessReports: PropTypes.bool,
        canReviewReports: PropTypes.bool, 
    }),
    onClose: PropTypes.func.isRequired,
};

  export default ReportsReviewModal;