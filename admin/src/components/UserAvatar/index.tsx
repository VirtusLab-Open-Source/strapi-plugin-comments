import { Avatar } from '@strapi/design-system';
import { FC } from 'react';
import { Author } from '../../api/schemas';
import { renderInitials } from '../../utils';

import { AdminAvatar } from './AdminAvatar';

type Props = Readonly<Pick<Author, 'avatar'> & {
  readonly name: string;
  readonly isAdminComment: boolean | null;
}>
export const UserAvatar: FC<Props> = ({ avatar, isAdminComment, name }) => {
  if (avatar) {
    const image = 'formats' in avatar ? avatar.formats?.thumbnail?.url ?? avatar.url : avatar.url;
    if (isAdminComment) {
      return (
        <AdminAvatar>
          {image ? <Avatar.Item src={image} alt={name} /> : null}
        </AdminAvatar>
      );
    }
    return image ? <Avatar.Item src={image} alt={name} /> : null;
  }
  if (isAdminComment) {
    return (
      <AdminAvatar>
        {name ? <Avatar.Item fallback={renderInitials(name)} /> : null}
      </AdminAvatar>
    );
  }
  return name ? <Avatar.Item fallback={renderInitials(name)} /> : null;
};