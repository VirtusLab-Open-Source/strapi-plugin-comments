import { FC, JSX } from 'react';
import { Comment } from '../../api/schemas';

export type DiscussionThreadItemProps = {
  readonly item: Comment;
  readonly root?: boolean;
  readonly preview?: boolean;
  readonly isSelected?: boolean;
  readonly blockedThread?: boolean | null;
  readonly pinned?: boolean;
  readonly isThreadAuthor?: boolean;
  readonly as?: keyof JSX.IntrinsicElements | FC;
}