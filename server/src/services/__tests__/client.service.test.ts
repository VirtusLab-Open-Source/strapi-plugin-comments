import { AdminUser, StrapiContext } from '../../@types';
import { APPROVAL_STATUS, REPORT_REASON } from '../../const';
import { getCommentRepository, getReportCommentRepository } from '../../repositories';
import { caster } from '../../test/utils';
import PluginError from '../../utils/error';
import { getPluginService } from '../../utils/getPluginService';
import clientService from '../client.service';
import { emailService } from '../email.service';

jest.mock('../../repositories', () => ({
  getCommentRepository: jest.fn(),
  getReportCommentRepository: jest.fn(),
}));

jest.mock('../../utils/getPluginService', () => ({
  getPluginService: jest.fn(),
}));

jest.mock('../email.service', () => ({
  emailService: jest.fn(),
}));

const defaultPopulate = {
  authorUser: {
    populate: ['avatar'],
  },
};

const defaultThreadOfPopulate = {
  threadOf: true,
  authorUser: {
    populate: ['avatar'],
  },
};

describe('client.service', () => {
  const mockCommonService = {
    parseRelationString: jest.fn(),
    getConfig: jest.fn(),
    isValidUserContext: jest.fn(),
    checkBadWords: jest.fn(),
    findOne: jest.fn(),
    sanitizeCommentEntity: jest.fn(),
    sanitizeCommentContent: jest.fn((content: string) => content),
  };

  const mockCommentRepository = {
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockReportCommentRepository = {
    create: jest.fn(),
  };

  const mockFindOne = jest.fn();
  const mockUserQuery = jest.fn().mockReturnValue({
    findOne: jest.fn(),
  });

  const mockEmailSend = jest.fn();

  const mockAdminUserQuery = {
    findMany: jest.fn(),
    findOne: jest.fn(),
  };

  const mockLog = {
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    caster<jest.Mock>(getPluginService).mockReturnValue(mockCommonService);
    caster<jest.Mock>(getCommentRepository).mockReturnValue(
      mockCommentRepository
    );
    caster<jest.Mock>(getReportCommentRepository).mockReturnValue(
      mockReportCommentRepository
    );
    caster<jest.Mock>(emailService).mockReturnValue({ send: mockEmailSend });
    mockFindOne.mockReset();
    mockUserQuery().findOne.mockReset();
  });

  const getStrapi = () =>
    caster<StrapiContext>({
      strapi: {
        documents: () => ({
          findOne: mockFindOne,
        }),
        query: (model: string) => {
          if (model === 'plugin::users-permissions.user') {
            return mockUserQuery();
          }
          if (model === 'admin::user') {
            return mockAdminUserQuery;
          }
          return { findOne: jest.fn() };
        },
        log: mockLog,
      },
    });
  const getService = (strapi: StrapiContext) => clientService(strapi);

  describe('create', () => {
    const mockUser: AdminUser = {
      id: 1,
      email: 'test@test.com',
      username: 'test',
    };
    const mockPayload = {
      relation: 'api::test.test:1' as const,
      content: 'Test comment',
      threadOf: null,
      author: null,
      approvalStatus: null,
      locale: 'en',
    };

    it('should create a comment with APPROVED status when approval flow is disabled', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockEntity = { id: 1, content: 'Test comment' };
      const mockSanitizedEntity = { id: 1, content: 'Clean comment' };
      const mockDbUser = { id: 1, avatar: { url: 'avatar-url' } };

      mockCommonService.parseRelationString.mockReturnValue({
        uid: 'api::test.test',
        relatedId: '1',
      });
      mockFindOne.mockResolvedValue({ id: 1 });
      mockCommonService.getConfig.mockResolvedValue([]);
      mockCommonService.isValidUserContext.mockReturnValue(true);
      mockCommonService.checkBadWords.mockResolvedValue('Test comment');
      mockCommentRepository.create.mockResolvedValue(mockEntity);
      mockCommonService.sanitizeCommentEntity.mockReturnValue(
        mockSanitizedEntity
      );
      mockUserQuery().findOne.mockResolvedValue(mockDbUser);

      const result = await service.create(mockPayload, mockUser);

      expect(result).toEqual(mockSanitizedEntity);
      expect(mockCommentRepository.create).toHaveBeenCalledWith({
        data: {
          authorUser: mockUser.id,
          content: 'Test comment',
          related: 'api::test.test:1',
          approvalStatus: APPROVAL_STATUS.APPROVED,
          locale: 'en',
          threadOf: null,
        },
        populate: defaultPopulate,
      });
    });

    it('should create a comment with PENDING status when approval flow is enabled', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockEntity = { id: 1, content: 'Test comment' };
      const mockSanitizedEntity = { id: 1, content: 'Clean comment' };
      const mockDbUser = { id: 1, avatar: { url: 'avatar-url' } };

      mockCommonService.parseRelationString.mockReturnValue({
        uid: 'api::test.test',
        relatedId: '1',
      });
      mockFindOne.mockResolvedValue({ id: 1 });
      mockCommonService.getConfig.mockResolvedValue(['api::test.test']);
      mockCommonService.isValidUserContext.mockReturnValue(true);
      mockCommonService.checkBadWords.mockResolvedValue('Test comment');
      mockCommentRepository.create.mockResolvedValue(mockEntity);
      mockCommonService.sanitizeCommentEntity.mockReturnValue(
        mockSanitizedEntity
      );
      mockUserQuery().findOne.mockResolvedValue(mockDbUser);

      const result = await service.create(mockPayload, mockUser);

      expect(result).toEqual(mockSanitizedEntity);
      expect(mockCommentRepository.create).toHaveBeenCalledWith({
        data: {
          authorUser: mockUser.id,
          content: 'Test comment',
          related: 'api::test.test:1',
          approvalStatus: APPROVAL_STATUS.PENDING,
          locale: 'en',
          threadOf: null,
        },
        populate: defaultPopulate,
      });
    });

    it('should create a comment using author data when no user is provided', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockAuthor = {
        id: 2,
        name: 'Author Name',
        email: 'author@test.com',
        avatar: 'avatar-url',
      };
      const mockEntity = { id: 1, content: 'Test comment' };
      const mockSanitizedEntity = { id: 1, content: 'Clean comment' };

      mockCommonService.parseRelationString.mockReturnValue({
        uid: 'api::test.test',
        relatedId: '1',
      });
      mockFindOne.mockResolvedValue({ id: 1 });
      mockCommonService.getConfig.mockResolvedValue([]);
      mockCommonService.isValidUserContext.mockReturnValue(false);
      mockCommonService.checkBadWords.mockResolvedValue('Test comment');
      mockCommentRepository.create.mockResolvedValue(mockEntity);
      mockCommonService.sanitizeCommentEntity.mockReturnValue(
        mockSanitizedEntity
      );

      const result = await service.create(
        {
          ...mockPayload,
          author: mockAuthor,
        },
        undefined
      );

      expect(result).toEqual(mockSanitizedEntity);
      expect(mockCommentRepository.create).toHaveBeenCalledWith({
        data: {
          authorId: mockAuthor.id,
          authorName: mockAuthor.name,
          authorEmail: mockAuthor.email,
          authorAvatar: mockAuthor.avatar,
          content: 'Test comment',
          related: 'api::test.test:1',
          approvalStatus: APPROVAL_STATUS.APPROVED,
          locale: 'en',
          threadOf: null,
        },
        populate: defaultPopulate,
      });
    });

    it('should throw error when no user is provided', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      const mockEntity = { id: 1, content: 'Test comment' };
      const mockSanitizedEntity = { id: 1, content: 'Clean comment' };

      mockCommonService.parseRelationString.mockReturnValue({
        uid: 'api::test.test',
        relatedId: '1',
      });
      mockFindOne.mockResolvedValue({ id: 1 });
      mockCommonService.getConfig.mockResolvedValue([]);
      mockCommonService.isValidUserContext.mockReturnValue(false);
      mockCommonService.checkBadWords.mockResolvedValue('Test comment');
      mockCommentRepository.create.mockResolvedValue(mockEntity);
      mockCommonService.sanitizeCommentEntity.mockReturnValue(
        mockSanitizedEntity
      );

      await expect(service.create(mockPayload)).rejects.toThrow(
        PluginError
      );
    });

    it('should throw error when relation does not exist', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      mockCommonService.parseRelationString.mockReturnValue({
        uid: 'api::test.test',
        relatedId: '1',
      });
      mockFindOne.mockResolvedValue(null);

      await expect(service.create(mockPayload, mockUser)).rejects.toThrow(
        PluginError
      );
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
        populate: defaultThreadOfPopulate,
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
        populate: defaultThreadOfPopulate,
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
        populate: defaultThreadOfPopulate,
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

  describe('sendAbuseReportEmail', () => {
    it('should send email to moderators using emailService', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      mockCommonService.getConfig.mockResolvedValue(['strapi-super-admin', 'moderator']);
      mockAdminUserQuery.findMany.mockResolvedValue([
        { email: 'admin1@test.com' },
        { email: 'admin2@test.com' },
      ]);
      mockAdminUserQuery.findOne.mockResolvedValue({ email: 'admin1@test.com' });

      await service.sendAbuseReportEmail('BAD_LANGUAGE', 'offensive content');

      expect(emailService).toHaveBeenCalledWith({ strapi: strapi.strapi });
      expect(mockEmailSend).toHaveBeenCalledWith({
        to: ['admin1@test.com', 'admin2@test.com'],
        from: 'admin1@test.com',
        subject: 'New abuse report on comment',
        text: expect.stringContaining('BAD_LANGUAGE'),
      });
      expect(mockEmailSend).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('offensive content'),
        }),
      );
    });

    it('should not send email when rolesToNotify is empty', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      mockCommonService.getConfig.mockResolvedValue([]);

      await service.sendAbuseReportEmail('BAD_LANGUAGE', 'offensive content');

      expect(mockAdminUserQuery.findMany).not.toHaveBeenCalled();
      expect(mockEmailSend).not.toHaveBeenCalled();
    });

    it('should not send email when no moderator emails found', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      mockCommonService.getConfig.mockResolvedValue(['strapi-super-admin']);
      mockAdminUserQuery.findMany.mockResolvedValue([]);

      await service.sendAbuseReportEmail('BAD_LANGUAGE', 'offensive content');

      expect(mockAdminUserQuery.findOne).not.toHaveBeenCalled();
      expect(mockEmailSend).not.toHaveBeenCalled();
    });

    it('should query admin users with correct role filter', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const roles = ['strapi-super-admin', 'editor'];

      mockCommonService.getConfig.mockResolvedValue(roles);
      mockAdminUserQuery.findMany.mockResolvedValue([{ email: 'a@test.com' }]);
      mockAdminUserQuery.findOne.mockResolvedValue({ email: 'a@test.com' });

      await service.sendAbuseReportEmail('OTHER', 'test');

      expect(mockAdminUserQuery.findMany).toHaveBeenCalledWith({
        where: { roles: { code: roles } },
      });
      expect(mockAdminUserQuery.findOne).toHaveBeenCalledWith({
        where: { roles: { code: 'strapi-super-admin' } },
      });
    });

    it('should throw when super admin user is not found for From address', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      mockCommonService.getConfig.mockResolvedValue(['strapi-super-admin']);
      mockAdminUserQuery.findMany.mockResolvedValue([{ email: 'moderator@test.com' }]);
      mockAdminUserQuery.findOne.mockResolvedValue(null);

      await expect(
        service.sendAbuseReportEmail('BAD_LANGUAGE', 'offensive content'),
      ).rejects.toThrow(/Cannot read properties of null \(reading 'email'\)/);

      expect(mockEmailSend).not.toHaveBeenCalled();
    });
  });

  describe('sendResponseNotification', () => {
    it('should send notification email when threadOf has author email', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const entity = {
        id: 1,
        content: 'Reply content',
        threadOf: {
          id: 10,
          author: { name: 'Thread Author', email: 'thread@test.com' },
        },
        author: { name: 'Replier', email: 'replier@test.com' },
      };

      mockAdminUserQuery.findOne.mockResolvedValue({ email: 'super@test.com' });
      mockCommonService.getConfig
        .mockResolvedValueOnce('noreply@app.com')
        .mockResolvedValueOnce('https://app.com');

      await service.sendResponseNotification(entity as any);

      expect(emailService).toHaveBeenCalledWith({ strapi: strapi.strapi });
      expect(mockEmailSend).toHaveBeenCalledWith({
        to: ['thread@test.com'],
        from: 'noreply@app.com',
        subject: "You've got a new response to your comment",
        text: expect.stringContaining('Thread Author'),
      });
    });

    it('should fetch thread when threadOf is an id', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const entity = {
        id: 1,
        content: 'Reply content',
        threadOf: 10,
        author: { name: 'Replier', email: 'replier@test.com' },
      };
      const thread = {
        id: 10,
        author: { name: 'Thread Author', email: 'thread@test.com' },
      };

      mockCommonService.findOne.mockResolvedValue(thread);
      mockAdminUserQuery.findOne.mockResolvedValue({ email: 'super@test.com' });
      mockCommonService.getConfig
        .mockResolvedValueOnce('noreply@app.com')
        .mockResolvedValueOnce('https://app.com');

      await service.sendResponseNotification(entity as any);

      expect(mockCommonService.findOne).toHaveBeenCalledWith({ id: 10 });
      expect(mockEmailSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['thread@test.com'],
        }),
      );
    });

    it('should resolve email from users-permissions user when authorUser exists and no author email', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const entity = {
        id: 1,
        content: 'Reply content',
        threadOf: {
          id: 10,
          authorUser: 42,
          author: { name: 'Thread Author' },
        },
        author: { name: 'Replier', email: 'replier@test.com' },
      };

      mockUserQuery().findOne.mockResolvedValue({ email: 'user42@test.com' });
      mockAdminUserQuery.findOne.mockResolvedValue({ email: 'super@test.com' });
      mockCommonService.getConfig
        .mockResolvedValueOnce('noreply@app.com')
        .mockResolvedValueOnce('https://app.com');

      await service.sendResponseNotification(entity as any);

      expect(mockUserQuery().findOne).toHaveBeenCalledWith({
        where: { id: 42 },
      });
      expect(mockEmailSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['user42@test.com'],
        }),
      );
    });

    it('should use authorUser object email directly when authorUser is an object', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const entity = {
        id: 1,
        content: 'Reply content',
        threadOf: {
          id: 10,
          authorUser: { id: 42, email: 'userobj@test.com' },
          author: { name: 'Thread Author' },
        },
        author: { name: 'Replier', email: 'replier@test.com' },
      };

      mockAdminUserQuery.findOne.mockResolvedValue({ email: 'super@test.com' });
      mockCommonService.getConfig
        .mockResolvedValueOnce('noreply@app.com')
        .mockResolvedValueOnce('https://app.com');

      await service.sendResponseNotification(entity as any);

      expect(mockEmailSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['userobj@test.com'],
        }),
      );
    });

    it('should do nothing when entity has no threadOf', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const entity = { id: 1, content: 'Top-level', threadOf: null };

      await service.sendResponseNotification(entity as any);

      expect(mockEmailSend).not.toHaveBeenCalled();
      expect(mockAdminUserQuery.findOne).not.toHaveBeenCalled();
    });

    it('should do nothing when no emailRecipient is found', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const entity = {
        id: 1,
        content: 'Reply content',
        threadOf: { id: 10, author: {} },
      };

      await service.sendResponseNotification(entity as any);

      expect(mockEmailSend).not.toHaveBeenCalled();
    });

    it('should return early and warn when emailSender is falsy', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const entity = {
        id: 1,
        content: 'Reply content',
        threadOf: {
          id: 10,
          author: { name: 'Thread Author', email: 'thread@test.com' },
        },
        author: { name: 'Replier', email: 'replier@test.com' },
      };

      mockAdminUserQuery.findOne.mockResolvedValue({ email: 'super@test.com' });
      mockCommonService.getConfig
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce('https://app.com');

      await service.sendResponseNotification(entity as any);

      expect(mockLog.warn).toHaveBeenCalledWith('Email sender or client app URL not found');
      expect(mockEmailSend).not.toHaveBeenCalled();
    });

    it('should return early and warn when clientAppUrl is falsy', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const entity = {
        id: 1,
        content: 'Reply content',
        threadOf: {
          id: 10,
          author: { name: 'Thread Author', email: 'thread@test.com' },
        },
        author: { name: 'Replier', email: 'replier@test.com' },
      };

      mockAdminUserQuery.findOne.mockResolvedValue({ email: 'super@test.com' });
      mockCommonService.getConfig
        .mockResolvedValueOnce('noreply@app.com')
        .mockResolvedValueOnce(undefined);

      await service.sendResponseNotification(entity as any);

      expect(mockLog.warn).toHaveBeenCalledWith('Email sender or client app URL not found');
      expect(mockEmailSend).not.toHaveBeenCalled();
    });

    it('should throw PluginError(500) when emailService send fails', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const entity = {
        id: 1,
        content: 'Reply content',
        threadOf: {
          id: 10,
          author: { name: 'Thread Author', email: 'thread@test.com' },
        },
        author: { name: 'Replier', email: 'replier@test.com' },
      };

      mockAdminUserQuery.findOne.mockResolvedValue({ email: 'super@test.com' });
      mockCommonService.getConfig
        .mockResolvedValueOnce('noreply@app.com')
        .mockResolvedValueOnce('https://app.com');
      const sendError = new Error('SMTP down');
      mockEmailSend.mockRejectedValueOnce(sendError);

      await expect(service.sendResponseNotification(entity as any)).rejects.toMatchObject({
        name: 'Strapi:Plugin:Comments',
        status: 500,
        message: 'Failed to send response notification email',
      });

      expect(mockLog.error).toHaveBeenCalledWith(sendError);
    });

    it('should include reply content and clientAppUrl in email text', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const entity = {
        id: 1,
        content: 'Insightful reply',
        threadOf: {
          id: 10,
          author: { name: 'Author', email: 'author@test.com' },
        },
        author: { name: 'Replier', email: 'replier@test.com' },
      };

      mockAdminUserQuery.findOne.mockResolvedValue({ email: 'super@test.com' });
      mockCommonService.getConfig
        .mockResolvedValueOnce('noreply@app.com')
        .mockResolvedValueOnce('https://myapp.com');

      await service.sendResponseNotification(entity as any);

      const sentText = mockEmailSend.mock.calls[0][0].text as string;
      expect(sentText).toContain('Insightful reply');
      expect(sentText).toContain('https://myapp.com');
      expect(sentText).toContain('Replier');
    });

    it('should fallback to emailRecipient when thread author name is missing', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const entity = {
        id: 1,
        content: 'Reply',
        threadOf: {
          id: 10,
          author: { email: 'noname@test.com' },
        },
        author: { name: 'Replier', email: 'replier@test.com' },
      };

      mockAdminUserQuery.findOne.mockResolvedValue({ email: 'super@test.com' });
      mockCommonService.getConfig
        .mockResolvedValueOnce('noreply@app.com')
        .mockResolvedValueOnce('https://app.com');

      await service.sendResponseNotification(entity as any);

      const sentText = mockEmailSend.mock.calls[0][0].text as string;
      expect(sentText).toContain('Hello noname@test.com');
    });

    it('should throw when super admin user is not found before reading contact config', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const entity = {
        id: 1,
        content: 'Reply content',
        threadOf: {
          id: 10,
          author: { name: 'Thread Author', email: 'thread@test.com' },
        },
        author: { name: 'Replier', email: 'replier@test.com' },
      };

      mockAdminUserQuery.findOne.mockResolvedValue(null);

      await expect(service.sendResponseNotification(entity as any)).rejects.toThrow(
        /Cannot read properties of null \(reading 'email'\)/,
      );

      expect(mockCommonService.getConfig).not.toHaveBeenCalled();
      expect(mockEmailSend).not.toHaveBeenCalled();
    });

    it('should not send when threadOf has no author and no authorUser', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const entity = {
        id: 1,
        content: 'Reply content',
        threadOf: { id: 10 },
        author: { name: 'Replier', email: 'replier@test.com' },
      };

      await service.sendResponseNotification(entity as any);

      expect(mockEmailSend).not.toHaveBeenCalled();
      expect(mockAdminUserQuery.findOne).not.toHaveBeenCalled();
    });

    it('should not send when users-permissions user is not found for authorUser', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const entity = {
        id: 1,
        content: 'Reply content',
        threadOf: {
          id: 10,
          authorUser: 99,
          author: { name: 'Thread Author' },
        },
        author: { name: 'Replier', email: 'replier@test.com' },
      };

      mockUserQuery().findOne.mockResolvedValue(null);

      await service.sendResponseNotification(entity as any);

      expect(mockUserQuery().findOne).toHaveBeenCalledWith({
        where: { id: 99 },
      });
      expect(mockEmailSend).not.toHaveBeenCalled();
      expect(mockAdminUserQuery.findOne).not.toHaveBeenCalled();
    });
  });
});
