import { Checkbox, Td, Tr, Typography } from '@strapi/design-system';
import { FC } from 'react';
import { useIntl } from 'react-intl';
import { Report } from '../../api/schemas';
import { getMessage } from '../../utils';
import { ReviewFlow } from '../ReviewFlow';
import { CommentReviewModal } from './CommentReviewModal';
import { ReportsActions } from './ReportsActions';

type ReportsTableRowProps = {
  item: Report;
  isChecked: boolean;
  onSelectionChange: (id: number) => void;
}
const cellMaxWidth = { maxWidth: '30vw' };

export const ReportsTableRow: FC<ReportsTableRowProps> = ({ item, isChecked, onSelectionChange }) => {
  const { formatDate } = useIntl();

  const onCheckedChange = () => {
    onSelectionChange(item.id);
  };
  console.log('isChecked', isChecked);

  return (
    <Tr>
      <Td>
        <Checkbox checked={isChecked} onCheckedChange={onCheckedChange} />
      </Td>
      <Td>
        <Typography textColor="neutral800" fontWeight="bold">
          #{item.id}
        </Typography>
      </Td>
      <Td>
        <Typography textColor="neutral800" variant="pi">
          {item.reason || getMessage('components.reason.unknown')}
        </Typography>
      </Td>
      <Td style={cellMaxWidth}>
        <Typography textColor="neutral800" ellipsis>
          {item.content || getMessage('compontents.content.unknown')}
        </Typography>
      </Td>
      <Td style={cellMaxWidth}>
        <Typography textColor="neutral800" ellipsis>
          {/*TODO: badge*/}
          1
        </Typography>
      </Td>
      <Td>
        <Typography textColor="neutral800">
          {formatDate(item.updatedAt || item.createdAt, {
            dateStyle: 'long',
            timeStyle: 'short',
          })}
        </Typography>
      </Td>
      <Td>
        <CommentReviewModal item={item} />
      </Td>
      <Td>
        <ReportsActions item={item} />
      </Td>
    </Tr>
  );
};