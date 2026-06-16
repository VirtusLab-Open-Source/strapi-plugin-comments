import { attachReactionsToComments, collectCommentDocumentIds } from '../reactions';

describe('reactions utils', () => {
  describe('collectCommentDocumentIds', () => {
    it('should collect documentIds from nested comments', () => {
      const comments = [
        {
          id: 1,
          documentId: 'doc-1',
          children: [
            {
              id: 2,
              documentId: 'doc-2',
              children: [],
            },
          ],
        },
      ];

      expect(collectCommentDocumentIds(comments as any)).toEqual(['doc-1', 'doc-2']);
    });
  });

  describe('attachReactionsToComments', () => {
    it('should attach reaction counts to each comment node', () => {
      const comments = [
        {
          id: 1,
          documentId: 'doc-1',
          children: [
            {
              id: 2,
              documentId: 'doc-2',
            },
          ],
        },
      ];

      const result = attachReactionsToComments(comments as any, {
        'doc-1': { like: 2 },
        'doc-2': { love: 1 },
      });

      expect((result[0] as { reactions: Record<string, number> }).reactions).toEqual({ like: 2 });
      expect((result[0].children?.[0] as { reactions: Record<string, number> }).reactions).toEqual({
        love: 1,
      });
    });
  });
});
