import { Box, Flex, Link, Typography } from '@strapi/design-system';
import { ArrowUp } from '@strapi/icons';
import { isNil } from 'lodash';

import { FC } from 'react';
import { CommentDetails } from '../../api/schemas';
import { DiscussionThreadItem } from '../../components/DiscussionThreadItem';
import { LoadingIndicatorOverlay } from '../../components/LoadingIndicatorOverlay';
import { AllowedActions } from '../../types';
import { getMessage } from '../../utils';
import { ModeratorResponse } from './ModeratorResponse';
import {CustomDiscussionThreadItem} from '../../components/CustomDiscussionThreadItem';

type DiscussionThreadProps = {
  readonly allowedActions: AllowedActions;
  readonly isReloading: boolean;
  readonly level: CommentDetails['level'];
  readonly selected: CommentDetails['selected'];
};
export const DiscussionThread: FC<DiscussionThreadProps> = ({ isReloading, level, selected }) => {
  const rootThread = selected?.threadOf
  return (
    <Box background="neutral0" width="100%" padding={4} position="relative" height="100%">
      {isReloading && <LoadingIndicatorOverlay />}
      <Flex
        style={{marginBottom: 2}}
        justifyContent="space-between"
      >
        <Typography
          variant="delta"
          textColor="neutral800"
          id="discussion-thread"
        >
          {getMessage('page.details.panel.discussion', 'Discussion')}
        </Typography>
        {
          rootThread && (
            <Link
              href={rootThread.id}
              startIcon={<ArrowUp />}
            >
              {getMessage('page.details.panel.discussion.nav.back', 'Go top')}
            </Link>
          )}
      </Flex>
      <Flex as="ul" direction="column" alignItems="flex-start" style={{marginBottom: 4}}>
        {level.map((item) => {
          const isSelected = selected?.id === item.id;
          const isThreadAuthor = !isNil(selected?.threadOf?.author?.id) && selected?.threadOf?.author?.id === item?.author?.id;
          return (
            <CustomDiscussionThreadItem
              key={`comment-${item.id}`}
              item={item as unknown as any}
              root={isNil(rootThread)}
              blockedThread={rootThread?.blockedThread || item.blockedThread}
              isSelected={isSelected}
              isThreadAuthor={isThreadAuthor}
            />
          );
        })}
        {rootThread && (
          <ModeratorResponse
            id={rootThread.id}
            blockedThread={!!rootThread.blockedThread}
          />
        )}
      </Flex>
    </Box>
  );
};
