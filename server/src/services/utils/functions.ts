import { StrapiAdmin, StrapiUser } from '@sensinum/strapi-utils';
import { get, isArray, isEmpty, isObject, isString } from 'lodash';
import { AdminUser, CommentAuthor, CoreStrapi, Id } from '../../@types-v5';
import { REGEX } from '../../utils/constants';
import PluginError from '../../utils/error';
import { Comment, CommentWithRelated } from '../../validators/repositories';

declare var strapi: CoreStrapi;

export const buildNestedStructure = (
  entities: Array<Comment | CommentWithRelated>,
  id: Id | null = null,
  field: string = 'threadOf',
  dropBlockedThreads = false,
  blockNestedThreads = false,
): Array<Comment> =>
  entities
  .filter((entity: Comment) => {
    const entityField: any = get(entity, field);
    if (entityField === null && id === null) {
      return true;
    }
    let data = entityField;
    if (data && typeof id === 'string') {
      data = data.toString();
    }
    return (
      (data && data == id) ||
      (isObject(entityField) && (entityField as any).id === id)
    );
  })
  .map((entity: Comment) => ({
    ...entity,
    [field]: undefined,
    related: undefined,
    blockedThread: blockNestedThreads || entity.blockedThread,
    children:
      entity.blockedThread && dropBlockedThreads
        ? []
        : buildNestedStructure(
          entities,
          entity.id,
          field,
          dropBlockedThreads,
          entity.blockedThread,
        ),
  }));

export const getRelatedGroups = (related: string): Array<string> =>
  related.split(REGEX.relatedUid).filter((s) => s && s.length > 0);

export const getModelUid = (name: string): string => {
  return strapi.plugin('comments').contentTypes[name]?.uid;
};

export const filterOurResolvedReports = (item: Comment): Comment =>
  item
    ? {
      ...item,
      reports: (item.reports || []).filter((report) => !report.resolved),
    }
    : item;

export const buildAuthorModel = (
  // TODO
  item: any,
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

  if (authorUser) {
    author = fieldsToPopulate.reduce(
      (prev, curr) => ({
        ...prev,
        [curr]: authorUser[curr],
      }),
      {
        id: authorUser.id,
        name: authorUser.username,
        email: authorUser.email,
        avatar:
          isString(authorUser.avatar) || isObject(authorUser.avatar)
            ? authorUser.avatar
            : undefined,
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
    author,
  };
};

export const buildConfigQueryProp = (
  prop: undefined | string | Array<string> = '',
): string => (isArray(prop) ? prop.join('.') : prop ?? '');

export const resolveUserContextError = (user?: AdminUser | StrapiUser): PluginError => {
  if (user) {
    throw new PluginError(401, 'Not authenticated');
  } else {
    throw new PluginError(403, 'Not authorized');
  }
};

export const getAuthorName = (author: StrapiAdmin): string => {

  const { lastname, username, firstname } = author;

  if (lastname)
    return `${firstname} ${lastname}`;
  else
    return username || firstname;
};
