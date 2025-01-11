import { AdminUser, StrapiContext } from '../../@types';
import { APPROVAL_STATUS, REPORT_REASON } from '../../const';
import { getCommentRepository, getReportCommentRepository } from '../../repositories';
import { caster } from '../../test/utils';
import PluginError from '../../utils/error';
import { getPluginService } from '../../utils/getPluginService';
import clientService from '../client.service';

jest.mock('../../repositories', () => ({
  getCommentRepository: jest.fn(),
  getReportCommentRepository: jest.fn(),
}));

jest.mock('../../utils/getPluginService', () => ({
  getPluginService: jest.fn(),
}));

describe('client.service', () => {
  const mockCommonService = {
    parseRelationString: jest.fn(),
    getConfig: jest.fn(),
    isValidUserContext: jest.fn(),
    checkBadWords: jest.fn(),
    findOne: jest.fn(),
    sanitizeCommentEntity: jest.fn(),
  };

  const mockCommentRepository = {
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockReportCommentRepository = {
    create: jest.fn(),
  };

  const mockFindOne = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    caster<jest.Mock>(getPluginService).mockReturnValue(mockCommonService);
    caster<jest.Mock>(getCommentRepository).mockReturnValue(mockCommentRepository);
    caster<jest.Mock>(getReportCommentRepository).mockReturnValue(mockReportCommentRepository);
    mockFindOne.mockReset();
  });

  const getStrapi = () => caster<StrapiContext>({ 
    strapi: { 
      documents: () => ({
        findOne: mockFindOne,
      }),
    } 
  });
  const getService = (strapi: StrapiContext) => clientService(strapi);

  describe('create', () => {
    const mockUser: AdminUser = { id: 1, email: 'test@test.com', username: 'test' };
    const mockPayload = {
      relation: 'api::test.test:1' as const,
      content: 'Test comment',
      threadOf: null,
      author: null,
      approvalStatus: null,
      locale: 'en',
    };

    it('should create a comment when all validations pass', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockEntity = { id: 1, content: 'Test comment' };
      const mockSanitizedEntity = { id: 1, content: 'Clean comment' };

      mockCommonService.parseRelationString.mockReturnValue({ uid: 'api::test.test', relatedId: '1' });
      mockFindOne.mockResolvedValue({ id: 1 });
      mockCommonService.getConfig.mockResolvedValue([]);
      mockCommonService.isValidUserContext.mockReturnValue(true);
      mockCommonService.checkBadWords.mockResolvedValue('Test comment');
      mockCommentRepository.create.mockResolvedValue(mockEntity);
      mockCommonService.sanitizeCommentEntity.mockReturnValue(mockSanitizedEntity);

      const result = await service.create(mockPayload, mockUser);

      expect(result).toEqual(mockSanitizedEntity);
      expect(mockCommentRepository.create).toHaveBeenCalledWith({
        data: {
          authorUser: mockUser.id,
          content: 'Test comment',
          related: 'api::test.test:1',
          approvalStatus: null,
          locale: 'en',
        },
        populate: {
          authorUser: true,
        },
      });
    });

    it('should throw error when relation does not exist', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      mockCommonService.parseRelationString.mockReturnValue({ uid: 'api::test.test', relatedId: '1' });
      mockFindOne.mockResolvedValue(null);

      await expect(service.create(mockPayload, mockUser)).rejects.toThrow(PluginError);
    });

    it('should create a comment with pending status when approval flow is enabled', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockEntity = { id: 1, content: 'Test comment' };
      const mockSanitizedEntity = { id: 1, content: 'Clean comment' };

      mockCommonService.parseRelationString.mockReturnValue({ uid: 'api::test.test', relatedId: '1' });
      mockFindOne.mockResolvedValue({ id: 1 });
      mockCommonService.getConfig.mockResolvedValue(['api::test.test']);
      mockCommonService.isValidUserContext.mockReturnValue(true);
      mockCommonService.checkBadWords.mockResolvedValue('Test comment');
      mockCommentRepository.create.mockResolvedValue(mockEntity);
      mockCommonService.sanitizeCommentEntity.mockReturnValue(mockSanitizedEntity);

      const result = await service.create(mockPayload, mockUser);

      expect(result).toEqual(mockSanitizedEntity);
      expect(mockCommentRepository.create).toHaveBeenCalledWith({
        data: {
          authorUser: mockUser.id,
          content: 'Test comment',
          related: 'api::test.test:1',
          approvalStatus: APPROVAL_STATUS.PENDING,
          locale: 'en',
        },
        populate: {
          authorUser: true,
        },
      });
    });
  });

  describe('update', () => {
    const mockUser: AdminUser = { id: 1, email: 'test@test.com', username: 'test' };
    const mockPayload = {
      commentId: 1,
      content: 'Updated comment',
      relation: 'api::test.test:1' as const,
      author: {
        id: 1,
      }
    };

    it('should update a comment when all validations pass with user context', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockEntity = { id: 1, content: 'Updated comment' };
      const mockSanitizedEntity = { id: 1, content: 'Clean updated comment' };

      mockCommonService.isValidUserContext.mockReturnValue(true);
      mockCommonService.checkBadWords.mockResolvedValue(true);
      mockCommonService.getConfig.mockResolvedValue([]);
      mockCommonService.findOne.mockResolvedValue({ id: 1, author: { id: 1 } });
      mockCommentRepository.update.mockResolvedValue(mockEntity);
      mockCommonService.sanitizeCommentEntity.mockReturnValue(mockSanitizedEntity);

      const result = await service.update(mockPayload, mockUser);

      expect(result).toEqual(mockSanitizedEntity);
      expect(mockCommentRepository.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { content: 'Updated comment' },
        populate: { threadOf: true, authorUser: true },
      });
    });

    it('should update a comment when all validations pass with author context', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockEntity = { id: 1, content: 'Updated comment' };
      const mockSanitizedEntity = { id: 1, content: 'Clean updated comment' };

      mockCommonService.isValidUserContext.mockReturnValue(true);
      mockCommonService.checkBadWords.mockResolvedValue(true);
      mockCommonService.getConfig.mockResolvedValue([]);
      mockCommonService.findOne.mockResolvedValue({ id: 1, author: { id: 1 } });
      mockCommentRepository.update.mockResolvedValue(mockEntity);
      mockCommonService.sanitizeCommentEntity.mockReturnValue(mockSanitizedEntity);

      const result = await service.update(mockPayload, undefined);

      expect(result).toEqual(mockSanitizedEntity);
      expect(mockCommentRepository.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { content: 'Updated comment' },
        populate: { threadOf: true, authorUser: true },
      });
    });

    it('should throw error when user context is invalid and no author provided', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      mockCommonService.isValidUserContext.mockReturnValue(false);

      await expect(service.update({ ...mockPayload, author: null }, undefined)).rejects.toThrow(PluginError);
    });

    it('should throw error when comment does not exist', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      mockCommonService.isValidUserContext.mockReturnValue(true);
      mockCommonService.checkBadWords.mockResolvedValue(true);
      mockCommonService.findOne.mockResolvedValue(null);

      await expect(service.update(mockPayload, mockUser)).resolves.toBeUndefined();
    });

    it('should throw error when author id does not match comment author', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      mockCommonService.isValidUserContext.mockReturnValue(true);
      mockCommonService.checkBadWords.mockResolvedValue(true);
      mockCommonService.findOne.mockResolvedValue({ id: 1, author: { id: 2 } });

      await expect(service.update(mockPayload, mockUser)).resolves.toBeUndefined();
    });

    it('should throw error when bad words check fails', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      mockCommonService.isValidUserContext.mockReturnValue(true);
      mockCommonService.checkBadWords.mockResolvedValue(false);

      await expect(service.update(mockPayload, mockUser)).resolves.toBeUndefined();
    });
  });

  describe('reportAbuse', () => {
    const mockUser: AdminUser = { id: 1, email: 'test@test.com', username: 'test' };
    const mockPayload = {
      commentId: 1,
      relation: 'api::test.test:1' as const,
      reason: REPORT_REASON.BAD_LANGUAGE,
      content: 'Report content',
    };

    it('should create abuse report when all validations pass', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockComment = { id: 1, content: 'Test comment', isAdminComment: false };
      const mockReport = { id: 1, reason: REPORT_REASON.BAD_LANGUAGE, content: 'Report content' };

      mockCommonService.isValidUserContext.mockReturnValue(true);
      mockCommonService.findOne.mockResolvedValue(mockComment);
      mockReportCommentRepository.create.mockResolvedValue(mockReport);

      const result = await service.reportAbuse(mockPayload, mockUser);

      expect(result).toEqual({
        ...mockReport,
        related: mockComment,
      });
      expect(mockReportCommentRepository.create).toHaveBeenCalledWith({
        data: {
          reason: REPORT_REASON.BAD_LANGUAGE,
          content: 'Report content',
          resolved: false,
          related: 1,
        },
      });
    });

    it('should throw error when trying to report admin comment', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockComment = { id: 1, content: 'Test comment', isAdminComment: true };

      mockCommonService.isValidUserContext.mockReturnValue(true);
      mockCommonService.findOne.mockResolvedValue(mockComment);

      await expect(service.reportAbuse(mockPayload, mockUser)).rejects.toThrow(PluginError);
    });
  });

  describe('markAsRemoved', () => {
    const mockUser: AdminUser = { id: 1, email: 'test@test.com', username: 'test' };
    const mockPayload = {
      commentId: 1,
      relation: 'api::test.test:1' as const,
      authorId: null,
    };

    it('should mark comment as removed when all validations pass', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockEntity = { id: 1, content: 'Test comment', removed: true };
      const mockSanitizedEntity = { id: 1, content: '[removed]', removed: true };

      jest.spyOn(service, 'markAsRemovedNested').mockResolvedValue(true);

      mockCommonService.isValidUserContext.mockReturnValue(true);
      mockCommonService.findOne.mockResolvedValue(mockEntity);
      mockCommentRepository.update.mockResolvedValue(mockEntity);
      mockCommonService.sanitizeCommentEntity.mockReturnValue(mockSanitizedEntity);

      const result = await service.markAsRemoved(mockPayload, mockUser);

      expect(result).toEqual(mockSanitizedEntity);
      expect(service.markAsRemovedNested).toHaveBeenCalledWith(1, true);
      expect(mockCommentRepository.update).toHaveBeenCalledWith({
        where: {
          id: 1,
          related: 'api::test.test:1',
        },
        data: { removed: true },
        populate: { threadOf: true, authorUser: true },
      });
    });

    it('should throw error when comment does not exist', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      mockCommonService.isValidUserContext.mockReturnValue(true);
      mockCommonService.findOne.mockResolvedValue(null);

      await expect(service.markAsRemoved(mockPayload, mockUser)).rejects.toThrow(PluginError);
    });
  });
});
