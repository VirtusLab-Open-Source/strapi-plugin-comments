import { StrapiContext } from '../../../@types';
import { getCommentRepository } from '../../../repositories';
import { caster } from '../../../test/utils';
import {
  attachReactionsToComments,
  collectCommentDocumentIds,
  collectNestedCommentDocumentIds,
} from '../reactions';

jest.mock('../../../repositories', () => ({
  getCommentRepository: jest.fn(),
}));

describe('reactions utils', () => {
  const mockCommentRepository = {
    findOne: jest.fn(),
    findMany: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    caster<jest.Mock>(getCommentRepository).mockReturnValue(mockCommentRepository);
  });

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

    it('should skip comments without documentId', () => {
      const comments = [
        {
          id: 1,
          documentId: null,
          children: [{ id: 2, documentId: 'doc-2' }],
        },
      ];

      expect(collectCommentDocumentIds(comments as any)).toEqual(['doc-2']);
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

    it('should attach empty reactions when documentId is missing in meta', () => {
      const comments = [{ id: 1, documentId: 'doc-unknown' }];

      const result = attachReactionsToComments(comments as any, {});

      expect((result[0] as { reactions: Record<string, number> }).reactions).toEqual({});
    });
  });

  describe('collectNestedCommentDocumentIds', () => {
    const getStrapi = () => caster<StrapiContext>({ strapi: {} as StrapiContext['strapi'] });

    it('should return empty array when comment has no documentId', async () => {
      mockCommentRepository.findOne.mockResolvedValue({ id: 1, documentId: null });

      const result = await collectNestedCommentDocumentIds(getStrapi(), 1);

      expect(result).toEqual([]);
      expect(mockCommentRepository.findMany).not.toHaveBeenCalled();
    });

    it('should return empty array when comment is not found', async () => {
      mockCommentRepository.findOne.mockResolvedValue(null);

      const result = await collectNestedCommentDocumentIds(getStrapi(), 1);

      expect(result).toEqual([]);
    });

    it('should collect documentIds from nested replies', async () => {
      mockCommentRepository.findOne
        .mockResolvedValueOnce({ id: 1, documentId: 'doc-1' })
        .mockResolvedValueOnce({ id: 2, documentId: 'doc-2' });
      mockCommentRepository.findMany
        .mockResolvedValueOnce([{ id: 2 }])
        .mockResolvedValueOnce([]);

      const result = await collectNestedCommentDocumentIds(getStrapi(), 1);

      expect(result).toEqual(['doc-1', 'doc-2']);
      expect(mockCommentRepository.findMany).toHaveBeenCalledWith({
        where: { threadOf: 1 },
      });
      expect(mockCommentRepository.findMany).toHaveBeenCalledWith({
        where: { threadOf: 2 },
      });
    });
  });
});
