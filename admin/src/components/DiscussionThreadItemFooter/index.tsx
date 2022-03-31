/**
 *
 * Discussion thread - Item footer
 *
 */

// @ts-nocheck

import React from "react";
import PropTypes from "prop-types";
import { useIntl } from "react-intl";
import { Avatar, Initials } from "@strapi/design-system/Avatar";
import { Box } from "@strapi/design-system/Box";
import { Typography } from "@strapi/design-system/Typography";
import { renderInitials } from "../../utils";
import {
  DiscussionThreadItemFooterMeta,
  DiscussionThreadItemFooterStyled,
} from "./styles";

const DiscussionThreadItemFooter = ({
  children,
  author,
  createdAt,
  updatedAt,
}) => {
  const { formatDate } = useIntl();

  const dateTime = formatDate(updatedAt || createdAt, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const { name, avatar } = author;

  return (
    <DiscussionThreadItemFooterStyled as={Box} paddingTop={2} direction="row">
      <DiscussionThreadItemFooterMeta size={3} horizontal>
        {avatar ? (
          <Avatar src={avatar} alt={name} />
        ) : (
          <Initials>{renderInitials(name)}</Initials>
        )}
        <Typography variant="pi" fontWeight="bold" textColor="neutral800">
          {name}
        </Typography>
        <Typography variant="pi" textColor="neutral600">
          {dateTime}
        </Typography>
      </DiscussionThreadItemFooterMeta>
      {children}
    </DiscussionThreadItemFooterStyled>
  );
};

DiscussionThreadItemFooter.propTypes = {
  author: PropTypes.shape({
    id: PropTypes.oneOfType(PropTypes.string, PropTypes.number).isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string,
    avatar: PropTypes.string,
  }).isRequired,
  createdAt: PropTypes.string.isRequired,
  updatedAt: PropTypes.string,
  children: PropTypes.array,
};

export default DiscussionThreadItemFooter;
