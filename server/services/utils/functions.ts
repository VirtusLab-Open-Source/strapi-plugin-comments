import { Id, IStrapi, StrapiUser } from "strapi-typed";
import { Comment, CommentAuthor, ToBeFixed } from "../../../types";

import PluginError from "./../../utils/error";
import { REGEX } from "./../../utils/constants";
import { first, get, isObject, isArray, isEmpty } from "lodash";

declare var strapi: IStrapi;

export const buildNestedStructure = (
  entities: Array<Comment>,
  id: Id | null = null,
  field: string = "threadOf",
  dropBlockedThreads = false,
  blockNestedThreads = false
): Array<Comment> =>
  entities
    .filter((entity: Comment) => {
      // mongo by default not return `null` for empty data
      const entityField: any = get(entity, field);
      if (entityField === null && id === null) {
        return true;
      }
      let data = entityField;
      if (data && typeof id === "string") {
        data = data.toString();
      }
      return (
        (data && data === id) ||
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
              entity.blockedThread
            ),
    }));

export const isEqualEntity = (
  existing: Comment,
  data: ToBeFixed,
  user: StrapiUser
): boolean => {
  const { author: existingAuthor = {} as CommentAuthor } = existing;
  const { author } = data;

  // Disallow approval status change by Client
  if (data.approvalStatus && existing.approvalStatus !== data.approvalStatus) {
    return false;
  }

  // Make sure that author is exact the same
  if (user) {
    const existingUserId = existingAuthor?.id || existingAuthor;
    const receivedUserId = user?.id || author?.id;
    return receivedUserId && existingUserId === receivedUserId;
  }
  return existingAuthor.id === author?.id;
};

export const getRelatedGroups = (related: string): Array<string> =>
  related.split(REGEX.relatedUid).filter((s) => s && s.length > 0);

export const getModelUid = (name: string): string => {
  return strapi.plugin("comments").contentTypes[name]?.uid;
};

export const filterOurResolvedReports = (item: Comment): Comment =>
  item
    ? {
        ...item,
        reports: (item.reports || []).filter((report) => !report.resolved),
      }
    : item;

export const convertContentTypeNameToSlug = (str: string): string => {
  const plainConversion = str.replace(
    /[A-Z]/g,
    (letter) => `-${letter.toLowerCase()}`
  );
  return first(plainConversion) === "-"
    ? plainConversion.slice(1, plainConversion.length)
    : plainConversion;
};

export const buildAuthorModel = (item: Comment): Comment => {
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
    author = {
      id: authorUser.id,
      name: authorUser.username,
      email: authorUser.email,
      avatar: authorUser.avatar,
    };
  } else if (authorId) {
    author = {
      id: authorId,
      name: authorName,
      email: authorEmail,
      avatar: authorAvatar,
    };
  }
  return {
    ...rest,
    author: isEmpty(author) ? undefined : author,
  };
};

export const buildConfigQueryProp = (
  prop: undefined | string | Array<string> = ""
): string => isArray(prop) ? prop.join(".") : prop ?? "";

export const resolveUserContextError = (user: StrapiUser): PluginError => {
  if (user) {
    throw new PluginError(401, "Not authenticated");
  } else {
    throw new PluginError(403, "Not authorized");
  }
};
