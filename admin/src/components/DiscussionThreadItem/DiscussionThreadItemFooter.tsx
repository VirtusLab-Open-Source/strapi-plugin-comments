import { Flex, Typography } from '@strapi/design-system';

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
  const { name, avatar } = item.author || {};

  return (
    <Flex direction="row" paddingTop={2}>
      <DiscussionThreadItemFooterMeta>
        {item.author && <UserAvatar avatar={avatar} name={name} isAdminComment={item.isAdminComment} />}
        <Typography variant="pi" fontWeight="bold" textColor="neutral800">
          {name || getMessage('compontents.author.unknown')}
        </Typography>
        <Typography variant="pi" textColor="neutral600">
          {dateTime}
        </Typography>
        {children}
      </DiscussionThreadItemFooterMeta>
    </Flex>
  );
};