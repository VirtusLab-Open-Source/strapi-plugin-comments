import { IconButton } from '@strapi/design-system';
import { noop } from 'lodash';
import { FC } from 'react';
import { Comment } from '../../api/schemas';
import { AllowedActions } from '../../types';
import ReviewIcon from '../icons/review';

type Props = {
  item: Comment;
  queryToInvalidate: string;
  isAnyActionLoading: boolean;
  allowedActions: AllowedActions;
};
export const ReviewFlow: FC<Props> = ({
  item,
  queryToInvalidate,
  allowedActions,
}) => {
  return (
    <>
      <IconButton
        withTooltip={false}
        onClick={noop}
        label="Review"
      >
        <ReviewIcon />
      </IconButton>
    </>

  );
};