/**
 *
 * Discussion thread - Item footer
 *
 */

// TODO
// @ts-nocheck

import React from "react";
import PropTypes from "prop-types";
import { useIntl } from "react-intl";
import { Box } from "@strapi/design-system/Box";
import { Typography } from "@strapi/design-system/Typography";
import {
  DiscussionThreadItemFooterMeta,
  DiscussionThreadItemFooterStyled,
} from "./styles";
import UserAvatar from "../Avatar";
import { getMessage } from "../../utils";

const DiscussionThreadItemFooter = ({
  author,
  isAdminComment,
  children,
  createdAt,
  updatedAt,
}) => {
  const { formatDate } = useIntl();

  const dateTime = formatDate(updatedAt || createdAt, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const { name, avatar } = author || {};

  return (
    <DiscussionThreadItemFooterStyled as={Box} paddingTop={2} direction="row">
      <DiscussionThreadItemFooterMeta size={3} horizontal>
        { author && <UserAvatar avatar={avatar} name={name} isAdminComment={isAdminComment} /> }
        <Typography variant="pi" fontWeight="bold" textColor="neutral800">
          {name || getMessage("compontents.author.unknown")}
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
    avatar: PropTypes.oneOfType(PropTypes.string, PropTypes.object),
  }).isRequired,
  createdAt: PropTypes.string.isRequired,
  updatedAt: PropTypes.string,
  children: PropTypes.array,
};

export default DiscussionThreadItemFooter;
