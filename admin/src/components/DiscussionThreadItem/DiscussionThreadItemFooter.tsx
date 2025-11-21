import { Flex, Tooltip, Typography } from '@strapi/design-system';

import { FC, PropsWithChildren } from 'react';
import { useIntl } from 'react-intl';
import styled from 'styled-components';
import { getMessage } from '../../utils';
import { UserAvatar } from '../UserAvatar';
import { DiscussionThreadItemProps } from './props';

export const DiscussionThreadItemFooterMeta = styled(Flex)(() => ({
  '* + *': {
    marginLeft: '8px',
  },
}));

export const DiscussionThreadItemFooter: FC<PropsWithChildren<DiscussionThreadItemProps>> = ({ item, children }) => {
  const { formatDate } = useIntl();

  const dateTime = formatDate(item.updatedAt || item.createdAt, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const { name, avatar, email } = item.author || {};

  return (
    <Flex direction="row" paddingTop={2}>
      <DiscussionThreadItemFooterMeta>
        <Tooltip
          open={item.isAdminComment ? false : undefined}
          label={!item.isAdminComment ? email || getMessage('page.discover.table.header.author.email') : undefined}
          align="start"
          side="left">
          <Flex style={{ cursor: item.isAdminComment ? "default" : "help" }}>
            {item.author && <UserAvatar avatar={avatar} name={name} isAdminComment={item.isAdminComment} />}
            <Typography variant="pi" fontWeight="bold" textColor="neutral800">
              {name || getMessage('components.author.unknown')}
            </Typography>
          </Flex>
        </Tooltip>
        <Typography variant="pi" textColor="neutral600">
          {dateTime}
        </Typography>
        {children}
      </DiscussionThreadItemFooterMeta>
    </Flex>
  );
};