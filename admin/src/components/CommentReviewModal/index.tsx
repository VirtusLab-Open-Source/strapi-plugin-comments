/**
 *
 * Entity Details
 *
 */

// @ts-nocheck

import React from 'react';
import PropTypes from 'prop-types';
import {
  ModalLayout,
  ModalBody,
  ModalHeader,
  ModalFooter,
} from '@strapi/design-system/ModalLayout';
import { Typography } from "@strapi/design-system/Typography";
import { getMessage } from "../../utils";
import DiscussionThreadItem from "../DiscussionThreadItem";

const CommentReviewModal = ({
  children,
  endActions,
  isVisible = false,
  item,
  onClose,
  startActions,
}) =>
  isVisible && (
    <ModalLayout onClose={onClose}>
      <ModalHeader>
        <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
          {getMessage(
            "page.details.panel.discussion.warnings.comments.header",
            "Open reports",
          )}
        </Typography>
      </ModalHeader>
      <ModalBody>
        <DiscussionThreadItem
          {...item.related}
          as="div"
          isSelected
          preview
          root
        />
        {children}
      </ModalBody>
      <ModalFooter
        variant="tertiary"
        startActions={startActions}
        endActions={endActions}
      />
    </ModalLayout>
  );


export default CommentReviewModal;
