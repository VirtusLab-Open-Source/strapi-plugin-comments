import { isProfane, replaceProfanities } from 'no-profanity';
import { StrapiContext } from '../../@types';
import { APPROVAL_STATUS } from '../../const';
import { CommentsPluginConfig } from '../../config';
import { getCommentRepository, getStoreRepository } from '../../repositories';
import { getOrderBy } from '../../repositories/utils';
import { caster } from '../../test/utils';
import PluginError from '../../utils/PluginError';
import { Comment } from '../../validators/repositories';
import commonService from '../common.service';

type CommentWithChildren = Comment & {
  children?: CommentWithChildren[];
};

jest.mock('../../repositories', () => ({
  getCommentRepository: jest.fn(),
  getStoreRepository: jest.fn(),
}));
jest.mock('../../repositories/utils', () => ({
  getOrderBy: jest.fn(),
}));

jest.mock('no-profanity', () => ({
  isProfane: jest.fn(),
  replaceProfanities: jest.fn(),
}));

describe('common.service', () => {
  const mockCommentRepository = {
    findOne: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    findWithCount: jest.fn(),
  };

  const mockStoreRepository = {
    getConfig: jest.fn(),
    getLocalConfig: jest.fn(),
  };

  const mockFindOne = jest.fn();
  const mockFindMany = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    caster<jest.Mock>(getCommentRepository).mockReturnValue(mockCommentRepository);
    caster<jest.Mock>(getStoreRepository).mockReturnValue(mockStoreRepository);
  });

  const getStrapi = () =>
    caster<StrapiContext>({
      strapi: {
        documents: () => ({
          findOne: mockFindOne,
          findMany: mockFindMany,
        }),
        plugin: () => null,
      },
    });

  const getService = (strapi: StrapiContext) => commonService(strapi);

  describe('getConfig', () => {
    it('should return full config when no prop is specified', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockConfig: Partial<CommentsPluginConfig> = {
        isValidationEnabled: true,
        moderatorRoles: ['admin'],
      };

      mockStoreRepository.getConfig.mockResolvedValue(mockConfig);

      const result = await service.getConfig();

      expect(result).toEqual(mockConfig);
    });

    it('should return specific config prop when specified', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockConfig: Partial<CommentsPluginConfig> = {
        moderatorRoles: ['admin'],
      };

      mockStoreRepository.getConfig.mockResolvedValue(mockConfig);

      const result = await service.getConfig('moderatorRoles');

      expect(result).toEqual(['admin']);
    });

    it('should return local config when useLocal is true', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const defaultValue = ['admin'];

      mockStoreRepository.getLocalConfig.mockReturnValue(defaultValue);

      const result = await service.getConfig('moderatorRoles', defaultValue, true);

      expect(result).toEqual(defaultValue);
    });
  });

  describe('parseRelationString', () => {
    it('should correctly parse relation string', () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const relation = 'api::test.test:1';

      const result = service.parseRelationString(relation);

      expect(result).toEqual({
        uid: 'api::test.test',
        relatedId: '1',
      });
    });
  });

  describe('sanitizeCommentContent', () => {
    it('should return sanitized content preserving allowed HTML', () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const content = '<p>Hello <strong>world</strong></p>';

      const result = service.sanitizeCommentContent(content);

      expect(result).toBe('<p>Hello <strong>world</strong></p>');
    });

    it('should strip script tags to prevent XSS', () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const content = '<p>Safe</p><script>alert("xss")</script>';

      const result = service.sanitizeCommentContent(content);

      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
      expect(result).toContain('<p>Safe</p>');
    });

    it('should strip event handlers from elements', () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const content = '<p onclick="alert(1)">Click me</p>';

      const result = service.sanitizeCommentContent(content);

      expect(result).not.toContain('onclick');
    });
  });

  describe('isValidUserContext', () => {
    it('should return true for valid user context', () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const user = { id: 1 };

      const result = service.isValidUserContext(user);

      expect(result).toBe(true);
    });

    it('should return false for invalid user context', () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const user = {};

      const result = service.isValidUserContext(user);

      expect(result).toBe(false);
    });

    it('should return true when no user is provided', () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      const result = service.isValidUserContext();

      expect(result).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should find and return a comment', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockComment = { id: 1, content: 'Test comment' };

      mockCommentRepository.findOne.mockResolvedValue(mockComment);
      mockStoreRepository.getConfig.mockResolvedValue([]);

      const result = await service.findOne({ id: 1 });

      expect(result).toBeDefined();
      expect(mockCommentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        populate: {
          reports: true,
          authorUser: {
            populate: ['avatar'],
          },
        },
      });
    });

    it('should throw error when comment does not exist', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      mockCommentRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne({ id: 1 })).rejects.toThrow(PluginError);
    });
  });

  describe('checkBadWords', () => {
    it('should pass clean content', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const content = 'Clean content';

      mockStoreRepository.getConfig.mockResolvedValue(true);
      caster<jest.Mock>(isProfane).mockReturnValue(false);

      const result = await service.checkBadWords(content);

      expect(result).toBe(content);
    });

    it('should throw error for profane content', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const content = 'Bad content';

      mockStoreRepository.getConfig.mockResolvedValue(true);
      caster<jest.Mock>(isProfane).mockReturnValue(true);
      caster<jest.Mock>(replaceProfanities).mockReturnValue('Filtered content');

      await expect(service.checkBadWords(content)).rejects.toThrow(PluginError);
    });
  });

  describe('findAllFlat', () => {
    it('should return flat list of comments', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockComments = [
        { id: 1, content: 'Comment 1' },
        { id: 2, content: 'Comment 2' },
      ];

      mockCommentRepository.findWithCount.mockResolvedValue({
        results: mockComments,
        pagination: { total: 2 },
      });
      caster<jest.Mock>(getOrderBy).mockReturnValue(['createdAt', 'desc']);

      mockStoreRepository.getConfig.mockResolvedValue([]);

      const result = await service.findAllFlat({
        fields: ['id', 'content'],
        limit: 10,
        skip: 0,
      });

      expect(result.data).toHaveLength(2);
      expect(mockCommentRepository.findWithCount).toHaveBeenCalled();
    });
    it('should return flat list of comments with populated user properties', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockComments = [
        { id: 1, content: 'Comment 1', avatar: { url: 'avatar2.png' } },
        { id: 2, content: 'Comment 2', avatar: { url: 'avatar2.png' } },
      ];

      mockCommentRepository.findWithCount.mockResolvedValue({
        results: mockComments,
        pagination: { total: 2 },
      });
      caster<jest.Mock>(getOrderBy).mockReturnValue(['createdAt', 'desc']);

      mockStoreRepository.getConfig.mockResolvedValue([]);

      const result = await service.findAllFlat({
        fields: ['id', 'content'],
        limit: 10,
        skip: 0,
        populate: {
          authorUser: {
            avatar: {
              populate: true,
            },
          },
        },
      });

      expect(result.data).toHaveLength(2);
      expect(mockCommentRepository.findWithCount).toHaveBeenCalled();
    });
    it('should merge related entity when relatedEntity is provided', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockComments = [{ id: 1, content: 'Comment 1', related: 'api::test.test:1' }];

      const relatedEntity = {
        documentId: '1',
        uid: 'api::test.test',
        title: 'Test',
      };

      mockCommentRepository.findWithCount.mockResolvedValue({
        results: mockComments,
        pagination: { total: 1 },
      });
      mockStoreRepository.getConfig.mockResolvedValue([]);
      caster<jest.Mock>(getOrderBy).mockReturnValue(['createdAt', 'desc']);

      const result = await service.findAllFlat(
        {
          fields: ['id', 'content'],
        },
        relatedEntity
      );

      expect(result.data).toHaveLength(1);
      expect(result.data[0].related).toEqual(relatedEntity);
    });
    it('should handle authorUser populate and threadOf filter', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockComments = [{ id: 1, content: 'Comment 1', threadOf: '5' }];

      mockCommentRepository.findWithCount.mockResolvedValue({
        results: mockComments,
        pagination: { total: 1 },
      });
      mockStoreRepository.getConfig.mockResolvedValue([]);
      caster<jest.Mock>(getOrderBy).mockReturnValue(['createdAt', 'desc']);

      const result = await service.findAllFlat({
        fields: ['id', 'content'],
        filters: { threadOf: '5' },
        populate: {
          authorUser: {
            populate: true,
          },
        },
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].threadOf).toBe(5);
    });
    it('should use pagination pageSize and page when provided', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      mockCommentRepository.findWithCount.mockResolvedValue({
        results: [],
        pagination: { total: 0 },
      });
      mockStoreRepository.getConfig.mockResolvedValue([]);
      caster<jest.Mock>(getOrderBy).mockReturnValue(['createdAt', 'desc']);

      await service.findAllFlat({
        fields: ['id', 'content'],
        pagination: { pageSize: 20, page: 3 },
      });

      expect(mockCommentRepository.findWithCount).toHaveBeenCalledWith(
        expect.objectContaining({
          pageSize: 20,
          page: 3,
        })
      );
    });
    it('should fetch related entities when relatedEntity is null', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockComments = [
        { id: 1, content: 'Comment 1', related: 'api::test.test:1', locale: 'en' },
      ];

      mockCommentRepository.findWithCount.mockResolvedValue({
        results: mockComments,
        pagination: { total: 1 },
      });

      mockFindOne.mockResolvedValue({
        documentId: '1',
        uid: 'api::test.test',
        title: 'Test',
        locale: 'en',
      });

      const result = await service.findAllFlat({ fields: ['id', 'content'] }, null);

      expect(result.data).toHaveLength(1);
      expect(mockFindOne).toHaveBeenCalled();
    });
    it('should skip blocked author props when isAdmin is true', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      mockCommentRepository.findWithCount.mockResolvedValue({
        results: [],
        pagination: { total: 0 },
      });
      caster<jest.Mock>(getOrderBy).mockReturnValue(['createdAt', 'desc']);

      await service.findAllFlat({
        fields: ['id', 'content'],
        isAdmin: true,
      });

      expect(mockStoreRepository.getConfig).not.toHaveBeenCalled();
    });
    it('should handle populated threadOf object', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockComments = [
        {
          id: 1,
          content: 'Reply',
          threadOf: { id: 5, content: 'Parent', authorName: 'John' },
        },
      ];

      mockCommentRepository.findWithCount.mockResolvedValue({
        results: mockComments,
        pagination: { total: 1 },
      });
      mockStoreRepository.getConfig.mockResolvedValue([]);
      caster<jest.Mock>(getOrderBy).mockReturnValue(['createdAt', 'desc']);

      const result = await service.findAllFlat({
        fields: ['id', 'content'],
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].threadOf).toBeDefined();
    });
  });

  describe('sanitizeCommentEntity', () => {
    it('should handle populate as an array', () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const entity = { id: 1, content: 'Test', authorName: 'John' };

      const result = service.sanitizeCommentEntity(entity, [], [], ['authorUser']);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });
    it('should handle populate as an object', () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const entity = { id: 1, content: 'Test', authorName: 'John' };

      const result = service.sanitizeCommentEntity(entity, [], [], { authorUser: true });

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });
  });

  describe('modifiedNestedNestedComments', () => {
    describe("when nested entries don't have relation", () => {
      it('should modify nested comments recursively', async () => {
        const strapi = getStrapi();
        const service = getService(strapi);
        const mockComments = [
          { id: 2, threadOf: 1 },
          { id: 3, threadOf: 1 },
        ];

        mockCommentRepository.findMany.mockResolvedValue(mockComments).mockResolvedValueOnce([]);
        mockCommentRepository.updateMany.mockResolvedValue({ count: 2 });

        const result = await service.modifiedNestedNestedComments(1, 'removed', true);

        expect(result).toBe(true);
        expect(mockCommentRepository.updateMany).toHaveBeenCalled();
      });
    });

    describe('when nested entries have relation', () => {
      it('should change entries to the deepLimit', async () => {
        const strapi = getStrapi();
        const service = getService(strapi);
        const mockComments = [
          { id: 2, threadOf: 1 },
          { id: 3, threadOf: 1 },
        ];

        mockCommentRepository.findMany.mockResolvedValue(mockComments);
        mockCommentRepository.updateMany.mockResolvedValue({ count: 2 });

        const result = await service.modifiedNestedNestedComments(1, 'removed', true);

        expect(result).toBe(true);
        expect(mockCommentRepository.updateMany).toHaveBeenCalled();
      });
    });

    it('should return false on update failure', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      mockCommentRepository.findMany.mockRejectedValue(new Error('Update failed'));

      const result = await service.modifiedNestedNestedComments(1, 'removed', true);

      expect(result).toBe(false);
    });
  });

  describe('findAllInHierarchy', () => {
    it('should return comments in hierarchical structure', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockComments = [
        { id: 1, content: 'Parent 1', threadOf: null },
        { id: 2, content: 'Child 1', threadOf: '1' },
        { id: 3, content: 'Child 2', threadOf: '1' },
        { id: 4, content: 'Grandchild 1', threadOf: '2' },
      ];

      mockCommentRepository.findMany.mockResolvedValue(mockComments);
      caster<jest.Mock>(getOrderBy).mockReturnValue(['createdAt', 'desc']);
      mockCommentRepository.findWithCount.mockImplementation(async (args) => {
        const threadOf = args?.where?.threadOf?.$eq ?? null;
        const filtered = mockComments.filter((c) => c.threadOf === threadOf);
        return {
          results: filtered,
          pagination: { total: filtered.length },
        };
      });
      mockStoreRepository.getConfig.mockResolvedValue([]);

      const result = await service.findAllInHierarchy({
        fields: ['id', 'content', 'threadOf'],
        sort: 'createdAt:desc',
      });

      const typedResult = result as CommentWithChildren[];

      expect(typedResult).toHaveLength(1); // One root comment
      expect(typedResult[0].id).toBe(1); // Parent comment
      expect(typedResult[0].children).toHaveLength(2); // Two child comments
      expect(typedResult[0].children![0].children).toHaveLength(1); // One grandchild
    });

    it('should handle empty comments list', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      mockCommentRepository.findMany.mockResolvedValue([]);
      caster<jest.Mock>(getOrderBy).mockReturnValue(['createdAt', 'desc']);
      mockCommentRepository.findWithCount.mockResolvedValue({
        results: [],
        pagination: { total: 0 },
      });
      mockStoreRepository.getConfig.mockResolvedValue([]);

      const result = await service.findAllInHierarchy({
        fields: ['id', 'content', 'threadOf'],
      });

      expect(result).toHaveLength(0);
    });

    it('should start from specific comment when startingFromId is provided', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockComments = [
        { id: 2, content: 'Child 1', threadOf: '1' },
        { id: 3, content: 'Child 2', threadOf: '1' },
        { id: 4, content: 'Grandchild 1', threadOf: '2' },
        { id: 5, content: 'Grandchild 2', threadOf: '2' },
        { id: 6, content: 'Grandchild 3', threadOf: '4' },
      ];

      mockCommentRepository.findMany.mockResolvedValue(mockComments);
      caster<jest.Mock>(getOrderBy).mockReturnValue(['createdAt', 'desc']);
      mockCommentRepository.findWithCount.mockImplementation(async (args) => {
        const threadOf = args?.where?.threadOf?.$eq ?? args?.where?.threadOf.toString() ?? null;
        const filtered = mockComments.filter((c) => c.threadOf === threadOf);
        return {
          results: filtered,
          pagination: { total: filtered.length },
        };
      });
      mockStoreRepository.getConfig.mockResolvedValue([]);

      const result = await service.findAllInHierarchy({
        fields: ['id', 'content', 'threadOf'],
        startingFromId: 2,
      });

      const typedResult = result as CommentWithChildren[];

      expect(typedResult[0].id).toBe(4);
      expect(typedResult[0].children).toHaveLength(1);
    });

    it('should handle comments with dropBlockedThreads enabled', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockComments = [
        {
          id: 1,
          content: 'Parent 1',
          threadOf: null,
          dropBlockedThreads: true,
          blockedThread: true,
        },
        { id: 2, content: 'Child 1', threadOf: '1', dropBlockedThreads: false },
        { id: 3, content: 'Child 2', threadOf: '1', dropBlockedThreads: false },
        { id: 4, content: 'Grandchild 1', threadOf: '2', dropBlockedThreads: false },
      ];

      mockCommentRepository.findMany.mockResolvedValue(mockComments);
      caster<jest.Mock>(getOrderBy).mockReturnValue(['createdAt', 'desc']);
      mockCommentRepository.findWithCount.mockImplementation(async (args) => {
        const threadOf = args?.where?.threadOf?.$eq ?? null;
        const filtered = mockComments.filter((c) => c.threadOf === threadOf);
        return {
          results: filtered,
          pagination: { total: filtered.length },
        };
      });
      mockStoreRepository.getConfig.mockResolvedValue([]);

      const result = await service.findAllInHierarchy({
        fields: ['id', 'content', 'threadOf', 'blocked'],
        dropBlockedThreads: true,
      });

      const typedResult = result as CommentWithChildren[];

      expect(typedResult[0].children).toHaveLength(0); // drop blocked threads
    });
  });

  describe('updateComment', () => {
    it('should update a comment successfully', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockUpdatedComment = { id: 1, content: 'Updated content' };

      mockCommentRepository.update.mockResolvedValue(mockUpdatedComment);

      const result = await service.updateComment({ id: 1 }, { content: 'Updated content' });

      expect(result).toEqual(mockUpdatedComment);
      expect(mockCommentRepository.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { content: 'Updated content' },
      });
    });

    it('should throw an error if update fails', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      mockCommentRepository.update.mockRejectedValue(new Error('Update failed'));

      await expect(
        service.updateComment({ id: 1 }, { content: 'Updated content' })
      ).rejects.toThrow('Update failed');
    });
  });

  describe('changeBlockedComment', () => {
    it('should set blocked from forceStatus when provided', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockComment = { id: 1, content: 'c', blocked: false };

      mockCommentRepository.findOne.mockResolvedValue(mockComment);
      mockStoreRepository.getConfig.mockResolvedValue([]);
      mockCommentRepository.update.mockResolvedValue({ ...mockComment, blocked: true });

      const result = await service.changeBlockedComment(1, true);

      expect(result.blocked).toBe(true);
      expect(mockCommentRepository.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { blocked: true },
      });
    });

    it('should toggle blocked when forceStatus is omitted', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockComment = { id: 1, content: 'c', blocked: false };

      mockCommentRepository.findOne.mockResolvedValue(mockComment);
      mockStoreRepository.getConfig.mockResolvedValue([]);
      mockCommentRepository.update.mockResolvedValue({ ...mockComment, blocked: true });

      await service.changeBlockedComment(1);

      expect(mockCommentRepository.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { blocked: true },
      });
    });
  });

  describe('changeBlockedCommentThread', () => {
    it('should block comment, thread flag, and nested thread field when forceStatus is true', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockComment = { id: 1, content: 'c', blocked: false, blockedThread: false };

      mockCommentRepository.findOne.mockResolvedValue(mockComment);
      mockStoreRepository.getConfig.mockResolvedValue([]);
      mockCommentRepository.update.mockResolvedValue({
        ...mockComment,
        blocked: true,
        blockedThread: true,
      });
      mockCommentRepository.findMany.mockResolvedValue([]);
      mockCommentRepository.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.changeBlockedCommentThread(1, true);

      expect(result.blocked).toBe(true);
      expect(result.blockedThread).toBe(true);
      expect(mockCommentRepository.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { blocked: true, blockedThread: true },
      });
      expect(mockCommentRepository.findMany).toHaveBeenCalledWith({ where: { threadOf: 1 } });
    });

    it('should toggle when forceStatus is omitted', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockComment = { id: 1, content: 'c', blocked: true, blockedThread: true };

      mockCommentRepository.findOne.mockResolvedValue(mockComment);
      mockStoreRepository.getConfig.mockResolvedValue([]);
      mockCommentRepository.update.mockResolvedValue({
        ...mockComment,
        blocked: false,
        blockedThread: false,
      });
      mockCommentRepository.findMany.mockResolvedValue([]);
      mockCommentRepository.updateMany.mockResolvedValue({ count: 0 });

      await service.changeBlockedCommentThread(1);

      expect(mockCommentRepository.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { blocked: false, blockedThread: false },
      });
    });
  });

  describe('approveComment', () => {
    it('should set approval status to APPROVED and return sanitized entity', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const updated = { id: 1, content: 'c', approvalStatus: APPROVAL_STATUS.APPROVED };

      mockCommentRepository.update.mockResolvedValue(updated);
      mockStoreRepository.getConfig.mockResolvedValue([]);

      const result = await service.approveComment(1);

      expect(result.approvalStatus).toBe(APPROVAL_STATUS.APPROVED);
      expect(mockCommentRepository.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { approvalStatus: APPROVAL_STATUS.APPROVED },
      });
    });

    it('should throw when comment does not exist', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      mockCommentRepository.update.mockResolvedValue(null);

      await expect(service.approveComment(1)).rejects.toThrow(PluginError);
    });
  });

  describe('rejectComment', () => {
    it('should set approval status to REJECTED and return sanitized entity', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const updated = { id: 1, content: 'c', approvalStatus: APPROVAL_STATUS.REJECTED };

      mockCommentRepository.update.mockResolvedValue(updated);
      mockStoreRepository.getConfig.mockResolvedValue([]);

      const result = await service.rejectComment(1);

      expect(result.approvalStatus).toBe(APPROVAL_STATUS.REJECTED);
      expect(mockCommentRepository.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { approvalStatus: APPROVAL_STATUS.REJECTED },
      });
    });

    it('should throw when comment does not exist', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      mockCommentRepository.update.mockResolvedValue(null);

      await expect(service.rejectComment(1)).rejects.toThrow(PluginError);
    });
  });

  describe('mergeRelatedEntityTo', () => {
    it('should merge related entity with comment', () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const comment = { id: 1, related: 'api::test.test:1', locale: 'en' };
      const relatedEntities = [
        { uid: 'api::test.test', documentId: '1', locale: 'en', title: 'Test Title' },
      ];

      const result = service.mergeRelatedEntityTo(comment, relatedEntities);

      expect(result).toEqual({
        ...comment,
        related: relatedEntities[0],
      });
    });

    it('should not merge if no related entity matches', () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const comment = { id: 1, related: 'api::test.test:1', locale: 'en' };
      const relatedEntities = [
        { uid: 'api::test.test', documentId: '2', locale: 'en', title: 'Test Title' },
      ];

      const result = service.mergeRelatedEntityTo(comment, relatedEntities);

      expect(result).toEqual({ ...comment, related: undefined });
    });

    it('should handle empty related entities array', () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const comment = { id: 1, related: 'api::test.test:1', locale: 'en' };

      const result = service.mergeRelatedEntityTo(comment, []);

      expect(result).toEqual({ ...comment, related: undefined });
    });

    it('should merge related entity without locale', () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const comment = { id: 1, related: 'api::test.test:1' };
      const relatedEntities = [{ uid: 'api::test.test', documentId: '1', title: 'Test Title' }];

      const result = service.mergeRelatedEntityTo(comment, relatedEntities);

      expect(result).toEqual({
        ...comment,
        related: relatedEntities[0],
      });
    });
  });

  describe('findAllPerAuthor', () => {
    it('should return comments for a specific author', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockComments = [
        { id: 1, content: 'Comment 1', authorId: 1 },
        { id: 2, content: 'Comment 2', authorId: 1 },
      ];

      mockCommentRepository.findWithCount.mockResolvedValue({
        results: mockComments,
        pagination: { total: 2 },
      });
      mockStoreRepository.getConfig.mockResolvedValue([]);

      caster<jest.Mock>(getOrderBy).mockReturnValue(['createdAt', 'desc']);

      const result = await service.findAllPerAuthor({
        authorId: 1,
        fields: ['id', 'content'],
      });

      expect(result.data).toHaveLength(2);
      expect(result.data.every((item) => !item.authorUser)).toBeTruthy();
      expect(mockCommentRepository.findWithCount).toHaveBeenCalledWith({
        pageSize: 10,
        page: 1,
        populate: {
          authorUser: {
            populate: true,
            avatar: { populate: true },
          },
        },
        select: ['id', 'content', 'related'],
        orderBy: { createdAt: 'desc' },
        where: { authorId: 1 },
      });
    });

    it('should return empty data if authorId is not provided', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      const result = await service.findAllPerAuthor({
        fields: ['id', 'content'],
      });

      expect(result.data).toHaveLength(0);
    });

    it('should filter comments correctly for Strapi authors', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockComments = [
        { id: 1, content: 'Comment 1', authorUser: { id: 1 } },
        { id: 2, content: 'Comment 2', authorUser: { id: 1 } },
      ];

      mockCommentRepository.findWithCount.mockResolvedValue({
        results: mockComments,
        pagination: { total: 2 },
      });

      mockStoreRepository.getConfig.mockResolvedValue([]);

      const result = await service.findAllPerAuthor(
        {
          authorId: 1,
          fields: ['id', 'content'],
        },
        true
      );

      expect(result.data).toHaveLength(2);
      expect(result.data.every((item) => !item.authorUser)).toBeTruthy();
      expect(mockCommentRepository.findWithCount).toHaveBeenCalledWith({
        where: { authorUser: { id: 1 } },
        pageSize: 10,
        page: 1,
        select: ['id', 'content', 'related'],
        orderBy: { createdAt: 'desc' },
        populate: {
          authorUser: {
            populate: true,
            avatar: { populate: true },
          },
        },
      });
    });
    it('should pass all query params to findAllPerAuthor', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      const mockComments = [
        { id: 1, content: 'Comment 1', authorId: 1, related: 'api::test.test:1' },
        { id: 2, content: 'Comment 2', authorId: 1, related: 'api::test.test:1' },
      ];

      mockCommentRepository.findWithCount.mockResolvedValue({
        results: mockComments,
        pagination: { total: mockComments.length },
      });

      const result = await service.findAllPerAuthor({
        authorId: 1,
        omit: ['related'],
        locale: 'en',
        sort: 'createdAt:desc',
        limit: 5,
        skip: 10,
      });

      expect(mockCommentRepository.findWithCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            authorId: 1,
            locale: 'en',
          }),
          pageSize: 5,
          page: 2,
        })
      );

      expect(result.data).toHaveLength(2);
      expect(result.data[0].related).toBeUndefined();
      expect(result.data[1].related).toBeUndefined();
    });
  });

  describe('findRelatedEntitiesFor', () => {
    it('should find related entities for given comments', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockComments = [
        { id: 1, related: 'api::test.test:1', locale: 'en' },
        { id: 1, related: 'api::test.test:1', locale: 'en' },
      ];
      const mockRelatedEntities = {
        uid: 'api::test.test',
        documentId: '1',
        locale: 'en',
        title: 'Test Title 1',
      };

      mockFindOne.mockResolvedValue(mockRelatedEntities);

      const result = await service.findRelatedEntitiesFor(mockComments);

      expect(result).toHaveLength(mockComments.length);
      expect(result).toEqual(expect.arrayContaining([mockRelatedEntities]));
    });

    it('should return an empty array if no related entities are found', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockComments = [{ id: 1, related: 'api::test.test:1', locale: 'en' }];

      mockFindOne.mockResolvedValue(undefined);

      const result = await service.findRelatedEntitiesFor(mockComments);

      expect(result).toHaveLength(0);
    });

    it('should handle comments with null locale', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockComments = [{ id: 1, related: 'api::test.test:1', locale: null }];

      mockFindOne.mockResolvedValue({
        documentId: '1',
        uid: 'api::test.test',
        title: 'Test',
      });

      await service.findRelatedEntitiesFor(mockComments);

      expect(mockFindOne).toHaveBeenCalledWith(
        expect.objectContaining({
          locale: undefined,
        })
      );
    });
  });

  describe('Handle entity updates', () => {
    it('should mark comments as deleted if related entry is deleted', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockComments = [
        { id: 1, related: 'api::test.test:1', locale: 'en' },
        { id: 1, related: 'api::test.test:1', locale: 'en' },
      ];
      const mockRelatedEntities = {
        uid: 'api::test.test',
        documentId: '1',
        locale: 'en',
        title: 'Test Title 1',
      };

      mockCommentRepository.findMany.mockResolvedValue(mockComments);
      mockCommentRepository.updateMany.mockResolvedValue({ count: 2 });

      const result = await service.perRemove(
        [mockRelatedEntities.uid, mockRelatedEntities.documentId].join(':')
      );

      expect(result).toEqual({ count: 2 });
      expect(mockCommentRepository.updateMany).toHaveBeenCalled();
    });
    it('should mark comments as removed for given relation and locale', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      mockCommentRepository.updateMany.mockResolvedValue({ count: 1 });

      await service.perRemove('api::test.test:1', 'en');

      expect(mockCommentRepository.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            related: 'api::test.test:1',
          }),
          data: { removed: true },
        })
      );
    });
    it('should include null locale filter when locale matches default locale', async () => {
      const strapiWithI18n = caster<StrapiContext>({
        strapi: {
          documents: () => ({
            findOne: mockFindOne,
            findMany: mockFindMany,
          }),
          plugin: (name: string) =>
            name === 'i18n' ? { service: () => ({ getDefaultLocale: () => 'en' }) } : null,
        },
      });
      const service = getService(strapiWithI18n);

      mockCommentRepository.updateMany.mockResolvedValue({ count: 1 });

      await service.perRemove('api::test.test:1', 'en');

      expect(mockCommentRepository.updateMany).toHaveBeenCalledWith({
        where: {
          related: 'api::test.test:1',
          $or: [{ locale: 'en' }, { locale: { $eq: null } }],
        },
        data: { removed: true },
      });
    });
  });
});
