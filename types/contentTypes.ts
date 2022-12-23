import { OnlyStrings, StrapiUser, StringMap } from "strapi-typed";

export type Id = number | string;

export type Comment<TAuthor = CommentAuthor> = {
  id: Id;
  content: string;
  author?: TAuthor;
  children?: Array<Comment>;
  reports?: Array<CommentReport>;
  threadOf: Comment | number | null;
  gotThread?: boolean;
  related?: any;
  blocked?: boolean;
  blockedThread?: boolean;
  itemsInTread?: number;
  approvalStatus?: CommentApprovalStatus | null;
  firstThreadItemId?: Id;
  threadFirstItemId?: Id;
  isAdminComment?: boolean;
} & CommentAuthorPartial;

export type CommentModelKeys = OnlyStrings<keyof Comment>;

type CommentApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export type CommentAuthor = {
  id: Id;
  name?: string;
  email?: string;
  avatar?: string | object;
};

export type CommentAuthorPartial = {
  authorId?: Id;
  authorName?: string;
  authorEmail?: string;
  authorAvatar?: string;
  authorUser?: StrapiUser;
};

export type CommentAuthorResolved<TExtension = StringMap<unknown>> =
  CommentAuthor & TExtension;

export type CommentReport = {
  id: Id;
  related: Comment | Id;
  reason: any;
  content: string;
  resolved: boolean;
};

export type RelatedEntity = {
  id: Id;
  uid: string;
  requireCommentsApproval?: boolean;
};
