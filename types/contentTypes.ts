export type Id = number | string;

export type Comment = {
    id: Id
    content?: string
    authorId?: number
    authorName?: string
    authorEmail?: string
    authorAvatar?: string
    author?: CommentAuthor
    children?: Array<Comment>
    threadOf?: number | null
    related?: any
    blocked?: boolean
    blockedThread?: boolean
    itemsInTread?: number
    firstThreadItemId?: Id
};

export type CommentAuthor = {
    id: Id
    name: string
    email?: string
    avatar?: string
};

export type RelatedEntity = {
    id: Id
    uid: string
};