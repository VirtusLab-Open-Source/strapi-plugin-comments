import { StrapiUser } from '@sensinum/strapi-utils';
import { get, isEmpty, isObject } from 'lodash';
import { AdminUser, CommentAuthor, Id } from '../../@types';
import { REGEX } from '../../utils/constants';
import PluginError from '../../utils/error';
import { Comment, CommentWithRelated } from '../../validators/repositories';

interface StrapiAuthorUser {
  id: Id;
  username: string;
  email: string;
  avatar?: string | object;
  [key: string]: unknown;
}

export const getRelatedGroups = (related: string): Array<string> =>
  related.split(REGEX.relatedUid).filter((s) => s && s.length > 0);

export const filterOurResolvedReports = (item: Comment): Comment =>
  item
    ? {
      ...item,
      reports: (item.reports || []).filter((report) => !report.resolved),
    }
    : item;

export const buildAuthorModel = (
  item: Comment | CommentWithRelated,
  blockedAuthorProps: Array<string>,
  fieldsToPopulate: Array<string> = [],
): Comment => {
  const {
    authorUser,
    authorId,
    authorName,
    authorEmail,
    authorAvatar,
    ...rest
  } = item;
  let author: CommentAuthor = {} as CommentAuthor;

  if (authorUser && typeof authorUser !== 'string') {
    const user = authorUser as StrapiAuthorUser;
    author = fieldsToPopulate.reduce(
      (prev, curr) => ({
        ...prev,
        [curr]: user[curr],
      }),
      {
        id: user.id,
        name: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    );
  } else if (authorId) {
    author = {
      id: authorId,
      name: authorName,
      email: authorEmail,
      avatar: authorAvatar,
    };
  }

  author = isEmpty(author) ? author : Object.fromEntries(
    Object.entries(author)
          .filter(([name]) => !blockedAuthorProps.includes(name)),
  ) as CommentAuthor;

  return {
    ...rest,
    author: isEmpty(author) ? (item.author || {}) : author,
  } as Comment;
};

export const resolveUserContextError = (user?: AdminUser | StrapiUser): PluginError => {
  if (user) {
    throw new PluginError(401, 'Not authenticated');
  } else {
    throw new PluginError(403, 'Not authorized');
  }
};

type AuthorNameProps = {
  lastname?: string;
  firstname?: string;
  username?: string;
};

export const getAuthorName = (author: AuthorNameProps): string => {
  const { lastname, username, firstname } = author;

  if (lastname && firstname) {
    return `${firstname} ${lastname}`;
  }
  return username || firstname || '';
};
