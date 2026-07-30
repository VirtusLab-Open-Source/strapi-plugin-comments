import { Id, StrapiContext } from '../../@types';
import { getCommentRepository } from '../../repositories';
import { ReactionsCount, ReactionsMeta } from '../reactions.service';

type CommentTreeNode = {
  documentId?: string | null;
  children?: Array<CommentTreeNode>;
};

export const collectCommentDocumentIds = (comments: Array<CommentTreeNode>): Array<string> =>
  comments.reduce<Array<string>>((acc, comment) => {
    const documentIds = comment.documentId ? [comment.documentId] : [];

    if (!comment.children?.length) {
      return [...acc, ...documentIds];
    }

    return [...acc, ...documentIds, ...collectCommentDocumentIds(comment.children)];
  }, []);

export const attachReactionsToComments = <T extends CommentTreeNode>(
  comments: Array<T>,
  reactionsMeta: ReactionsMeta
): Array<T & { reactions: ReactionsCount }> =>
  comments.map((comment) => ({
    ...comment,
    reactions: reactionsMeta[comment.documentId] || {},
    ...(comment.children?.length
      ? {
          children: attachReactionsToComments(comment.children, reactionsMeta),
        }
      : {}),
  }));

export const collectNestedCommentDocumentIds = async (
  { strapi }: StrapiContext,
  commentId: Id
): Promise<Array<string>> => {
  const entity = await getCommentRepository(strapi).findOne({
    where: { id: commentId },
  });

  if (!entity?.documentId) {
    return [];
  }

  const children = await getCommentRepository(strapi).findMany({
    where: { threadOf: commentId },
  });

  const nestedDocumentIds = await Promise.all(
    children.map((child) => collectNestedCommentDocumentIds({ strapi }, child.id))
  );

  return [entity.documentId, ...nestedDocumentIds.flat()];
};
