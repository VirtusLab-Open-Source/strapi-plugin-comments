/**
 *
 * Discussion thread - Item
 *
 */

// @ts-nocheck

import React from "react";
import PropTypes from "prop-types";
import { Box } from "@strapi/design-system/Box";
import { Flex } from "@strapi/design-system/Flex";
import { Typography } from "@strapi/design-system/Typography";
import DiscussionThreadItemFooter from "../DiscussionThreadItemFooter";
import DiscussionThreadItemActions from "../DiscussionThreadItemActions";
import {
  DiscussionThreadItemContainer,
  DiscussionThreadFullsize,
  DiscussionThreadItemContent,
} from "./styles";

const DiscussionThreadItem = (props) => {
  const { as = "li", isSelected, content, root, preview, pinned } = props;

  return (
    <DiscussionThreadFullsize as={as} marginBottom={preview ? 4 : 0}>
      <DiscussionThreadItemContainer
        as={Flex}
        direction="column"
        alignItems="flex-start"
        hasRadius
        background={isSelected ? "neutral100" : null}
        paddingLeft={2}
        paddingRight={2}
        paddingTop={4}
        paddingBottom={4}
      >
        <DiscussionThreadItemContent
          as={Flex}
          paddingBottom={2}
          direction="row"
        >
          <Box as={Flex} grow={1} alignItems="center" marginTop="6px">
            <Typography variant="omega" textColor="neutral800">
              {content}
            </Typography>
          </Box>
          {!preview && (
            <DiscussionThreadItemActions
              {...props}
              root={root || pinned}
              preview={preview}
            />
          )}
        </DiscussionThreadItemContent>
        <DiscussionThreadItemFooter {...props} />
      </DiscussionThreadItemContainer>
    </DiscussionThreadFullsize>
  );
};

DiscussionThreadItem.propTypes = {
  content: PropTypes.string.isRequired,
  allowedActions: PropTypes.shape({
    canModerate: PropTypes.bool,
    canAccessReports: PropTypes.bool,
    canReviewReports: PropTypes.bool,
  }),
};

export default DiscussionThreadItem;
