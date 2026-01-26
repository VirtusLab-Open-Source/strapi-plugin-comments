import { Box, Flex, Typography } from '@strapi/design-system';
import { FC, PropsWithChildren } from 'react';
import styled from 'styled-components';
import { DiscussionThreadItemActions } from './DiscussionThreadItemActions';
import { DiscussionThreadItemFooter } from './DiscussionThreadItemFooter';
import { DiscussionThreadItemProps } from './props';


export const DiscussionThreadItemContentTypographyRenderer = styled('div')(() => {
  return {
    strong: {
      fontWeight: 'bold',
    },
    i: {
      fontStyle: 'italic',
    },
    em: {
      fontStyle: 'italic',
    },
    u: {
      fontStyle: 'underline',
    },
  };
});


export const DiscussionThreadItem: FC<PropsWithChildren<DiscussionThreadItemProps>> = (props) => {
  const { root, preview, item, isSelected, pinned, as = 'li' } = props;
  return (
    <Box width="100%" as={as} marginBottom={preview ? 4 : 0}>
      <Flex
        width="100%"
        direction="column"
        alignItems="flex-start"
        hasRadius
        background={isSelected ? 'neutral100' : null}
        paddingLeft={2}
        paddingRight={2}
        paddingTop={4}
        paddingBottom={4}
      >
        <Flex
          alignItems="flex-start"
          paddingBottom={2}
          direction="column"
          gap={2}
          width="100%"
        >
          <Flex width="100%" justifyContent="space-between" marginTop="6px">
            <Flex grow={1} alignItems="center">
              <Typography variant="omega" textColor="neutral800">
                {/* TODO dangerouslySetInnerHTML in case of comments created by users is not safe
                and can cause XSS attacks. We need to sanitize the content before displaying it. */}
                <DiscussionThreadItemContentTypographyRenderer dangerouslySetInnerHTML={{ __html: item.content }} />
              </Typography>
            </Flex>
            {!preview && (
              <DiscussionThreadItemActions
                {...props}
                root={root || pinned}
                preview={preview}
              />
            )}
          </Flex>
          <DiscussionThreadItemFooter {...props} />
        </Flex>
      </Flex>
    </Box>
  );
};