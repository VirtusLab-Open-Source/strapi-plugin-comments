import { Box, Flex, Typography } from '@strapi/design-system';
import { FC, PropsWithChildren } from 'react';
import styled from 'styled-components';
import { DiscussionThreadItemActions } from './DiscussionThreadItemActions';
import { DiscussionThreadItemFooter } from './DiscussionThreadItemFooter';
import { DiscussionThreadItemProps } from './props';
import { Divider } from '@strapi/design-system';
import { useSanitizedHTML } from '../../hooks/useSanitizedHTML';

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

  const html = useSanitizedHTML(item.content);

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
          <Flex 
            width="100%"
            justifyContent="space-between"
            marginTop={{ initial: 0, medium: 1.5}}
            direction={{ initial: 'column-reverse', medium: 'row' }}
            alignItems={{ initial: 'flex-start', medium: 'center' }}
            gap={{ initial: 2, medium: 1}}
          >
            <Flex grow={1} alignItems="center">
              <Typography variant="omega" textColor="neutral800">
                <DiscussionThreadItemContentTypographyRenderer dangerouslySetInnerHTML={{ __html: html }} />
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
      <Divider />
    </Box>
  );
};