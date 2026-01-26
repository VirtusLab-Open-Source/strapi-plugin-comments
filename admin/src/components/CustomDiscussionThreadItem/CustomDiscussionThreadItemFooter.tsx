import {Flex, Tooltip, Typography} from '@strapi/design-system';

import {FC, PropsWithChildren} from 'react';
import {useIntl} from 'react-intl';
import styled from 'styled-components';
import {getMessage} from '../../utils';
import {UserAvatar} from '../UserAvatar';
import {DiscussionThreadItemProps} from './props';
import {Rating} from "../Rating";
import {LastExperience} from "../LastExperience";
import {SingleLineContent} from '../SingleLineComponent/SingleLineContent';

export const DiscussionThreadItemFooterMeta = styled(Flex)(() => ({
    '* + *': {
        marginLeft: '8px',
    },
}));

export const CustomDiscussionThreadItemFooter: FC<PropsWithChildren<DiscussionThreadItemProps>> = ({item, children}) => {
    const {formatDate} = useIntl();

    const dateTime = formatDate(item.updatedAt || item.createdAt, {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
    const {name, avatar, email} = item.author || {};

    return (
        <Flex direction="row" paddingTop={2} width="100%">
            <DiscussionThreadItemFooterMeta width="100%">
                <Flex width="100%" justifyContent={{initial: 'end'}}>
                    <Flex width="100%">
                        <Tooltip
                            open={item.isAdminComment ? false : undefined}
                            label={!item.isAdminComment ? email || getMessage('page.discover.table.header.author.email') : undefined}
                            align="start"
                            side="left">
                            <Flex style={{cursor: item.isAdminComment ? "default" : "help"}}
                                  justifyContent={{initial: 'space-between'}}>
                                {item.author &&
                                  <Flex minWidth="32px">
                                      <UserAvatar avatar={avatar} name={name} isAdminComment={item.isAdminComment}/>
                                  </Flex>
                                }
                                <SingleLineContent variant="pi" fontWeight="bold" textColor="neutral800">
                                    {name || getMessage('components.author.unknown')}
                                </SingleLineContent>
                            </Flex>
                        </Tooltip>
                        <Typography minWidth="30%" variant="pi" textColor="neutral600">
                            {dateTime}
                        </Typography>
                        {children}
                    </Flex>
                    <Flex width="30%" justifyContent={{initial: 'end'}}>
                        <LastExperience item={item}></LastExperience>
                    </Flex>
                    <Flex width="20%" justifyContent={{initial: 'end'}}>
                        <Rating item={item}></Rating>
                    </Flex>
                </Flex>
            </DiscussionThreadItemFooterMeta>
        </Flex>
    );
};