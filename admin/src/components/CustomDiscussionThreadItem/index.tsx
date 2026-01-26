import { Box, Flex } from '@strapi/design-system';
import { FC, PropsWithChildren } from 'react';
import styled from 'styled-components';
import { DiscussionThreadItemProps } from './props';
import {CustomDiscussionThreadItemActions} from './CustomDiscussionThreadItemActions';
import {CustomDiscussionThreadItemFooter} from './CustomDiscussionThreadItemFooter';
import {MultiLineContent} from '../MultiLineContent/MultiLineContent';

export const CustomDiscussionThreadItem: FC<PropsWithChildren<DiscussionThreadItemProps>> = (props) => {
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
              <MultiLineContent>
                { item.content }
              </MultiLineContent>
            </Flex>
            {!preview && (
              <CustomDiscussionThreadItemActions
                {...props}
                root={root || pinned}
                preview={preview}
              />
            )}
          </Flex>
          <CustomDiscussionThreadItemFooter {...props} />
        </Flex>
      </Flex>
    </Box>
  );
};