import { StrapiUser } from "./common";

export type Id = number | string;

export type Comment = {
    id: Id
    content?: string
    author?: CommentAuthor
    children?: Array<Comment>
    threadOf?: Comment | number | null
    related?: any
    blocked?: boolean
    blockedThread?: boolean
    itemsInTread?: number
    firstThreadItemId?: Id
} & CommentAuthorPartial;

export type CommentAuthor = {
    id: Id
    name: string
    email?: string
    avatar?: string
};

export type CommentAuthorPartial = {
    authorId?: number
    authorName?: string
    authorEmail?: string
    authorAvatar?: string
    authorUser?: StrapiUser
};

export type CommentReport = {
    id: Id
    reason: any
    content: string
};

export type RelatedEntity = {
    id: Id
    uid: string
    requireCommentsApproval?: boolean
};