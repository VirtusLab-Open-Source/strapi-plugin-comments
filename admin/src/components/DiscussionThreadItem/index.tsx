/**
 *
 * Discussion thread - Item
 *
 */

// TODO
// @ts-nocheck

import { Box } from "@strapi/design-system/Box";
import { Flex } from "@strapi/design-system/Flex";
import { Typography } from "@strapi/design-system/Typography";
import PropTypes from "prop-types";
import React, { useMemo } from "react";

import DiscussionThreadItemActions from "../DiscussionThreadItemActions";
import DiscussionThreadItemFooter from "../DiscussionThreadItemFooter";

import {
  DiscussionThreadItemContainer,
  DiscussionThreadFullsize,
  DiscussionThreadItemContent,
  DiscussionThreadItemContentTypographyRenderer,
} from "./styles";

import sanitizeHtml from './../PreviewWysiwyg/utils/satinizeHtml';
import md from "./../PreviewWysiwyg/utils/mdRenderer";

const DiscussionThreadItem = (props) => {
  const {
    as = "li",
    authorAvatar,
    authorName,
    content,
    isSelected,
    pinned,
    preview,
    root,
  } = props;

  const sanitizedContent = useMemo(() => sanitizeHtml(md.render(content || '')), [content]);

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
              <DiscussionThreadItemContentTypographyRenderer dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
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

// Typescript to fix!!!
// DiscussionThreadItem.propTypes = {
//   content: PropTypes.string.isRequired,
//   allowedActions: PropTypes.shape({
//     canModerate: PropTypes.bool,
//     canAccessReports: PropTypes.bool,
//     canReviewReports: PropTypes.bool,
//   }),
// };

export default DiscussionThreadItem;
