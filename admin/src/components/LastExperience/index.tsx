import {FC} from 'react';
import {Comment} from '../../api/schemas';
import {Flex, Typography} from '@strapi/design-system';
import {getMessage} from '../../utils';
import {useIntl} from 'react-intl';

type Props = {
  readonly item: Comment;
};

export const LastExperience: FC<Props> = ({item}) => {
  if (item.lastExperience) {

    const {formatDate} = useIntl();

    const dateTime = formatDate(item.lastExperience, {
      dateStyle: 'medium',
    });

    return (
      <Flex justifyContent={'end'}>
        <Typography variant="pi" fontWeight="bold" textColor="neutral800">
          {getMessage('page.discover.footer.lastExperience')}:
        </Typography>
        <Typography variant="pi" textColor="neutral600">
          {dateTime}
        </Typography>
      </Flex>
    );
  }
};
