import { Id, StrapiAdminUser } from "strapi-typed";

export type CommentDetails = {
    threadId: Id,
    body: string, 
    author: StrapiAdminUser
}

export type CommentUpdateDetails = {
    id: Id,
    body: string
}