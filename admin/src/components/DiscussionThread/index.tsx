/**
 *
 * Entity Details
 *
 */

// @ts-nocheck

import React from "react";
import PropTypes from "prop-types";
import { isNil } from "lodash";
import { Box } from "@strapi/design-system/Box";
import { Flex } from "@strapi/design-system/Flex";
import { Link } from "@strapi/design-system/Link";
import { Typography } from "@strapi/design-system/Typography";
import { ArrowUp } from "@strapi/icons";
import DiscussionThreadItem from "../DiscussionThreadItem";
import { getMessage, getUrl } from "../../utils";
import LoadingIndicatorOverlay from "../LoadingIndicatorOverlay";
import { LoadingIndicatorContainer } from "../LoadingIndicatorOverlay/styles";


const DiscussionThread = ({
  level = [],
  selected = {},
  allowedActions,
  isReloading,
}) => {
  const rootThread = selected?.threadOf;
  return (
    <LoadingIndicatorContainer as={Box} padding={4}>
      {isReloading && <LoadingIndicatorOverlay />}
      <Flex
        as={Box}
        direction="row"
        justifyContent="space-between"
        marginBottom={2}
      >
        <Typography
          variant="delta"
          textColor="neutral800"
          id="discussion-thread"
        >
          {getMessage("page.details.panel.discussion", "Discussion")}
        </Typography>
        {rootThread && (
          <Link
            to={getUrl(`discover/${rootThread.id}`)}
            startIcon={<ArrowUp />}
          >
            {getMessage("page.details.panel.discussion.nav.back")}
          </Link>
        )}
      </Flex>
      <Flex as="ul" direction="column" alignItems="flex-start" marginBottom={4}>
        {rootThread && (
          <DiscussionThreadItem
            {...rootThread}
            allowedActions={allowedActions}
            isThreadAuthor
            root
            pinned
          />
        )}
        {level.map((item) => {
          const isSelected = selected.id === item.id;
          const isThreadAuthor =
            !isNil(selected?.threadOf?.author?.id) &&
            selected?.threadOf?.author?.id === item?.author?.id;
          return (
            <DiscussionThreadItem
              key={`comment-${item.id}`}
              {...item}
              allowedActions={allowedActions}
              root={isNil(rootThread)}
              blockedThread={rootThread?.blockedThread || item.blockedThread}
              isSelected={isSelected}
              isThreadAuthor={isThreadAuthor}
            />
          );
        })}
      </Flex>
    </LoadingIndicatorContainer>
  );
};

DiscussionThread.propTypes = {
  level: PropTypes.array.isRequired,
  selected: PropTypes.object.isRequired,
  allowedActions: PropTypes.shape({
    canModerate: PropTypes.bool,
    canAccessReports: PropTypes.bool,
    canReviewReports: PropTypes.bool,
  }),
  isReloading: PropTypes.bool,
};

export default DiscussionThread;
