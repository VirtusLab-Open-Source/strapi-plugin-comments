import { StrapiContext } from '../../@types';
import { APPROVAL_STATUS } from '../../const';
import { getCommentRepository, getReportCommentRepository } from '../../repositories';
import { caster } from '../../test/utils';
import { getPluginService } from '../../utils/getPluginService';
import adminService from '../admin/admin.service';

jest.mock('../../repositories', () => ({
  getCommentRepository: jest.fn(),
  getReportCommentRepository: jest.fn(),
}));

jest.mock('../../utils/getPluginService', () => ({
  getPluginService: jest.fn(),
}));

describe('admin.service', () => {
  const mockCommonService = {
    findOne: jest.fn(),
    updateComment: jest.fn(),
    sanitizeCommentEntity: jest.fn(),
    parseRelationString: jest.fn(),
    findAllInHierarchy: jest.fn(),
    findRelatedEntitiesFor: jest.fn(),
    mergeRelatedEntityTo: jest.fn(),
    modifiedNestedNestedComments: jest.fn(),
  };

  const mockCommentRepository = {
    findOne: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    findWithCount: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  };

  const mockReportCommentRepository = {
    findPage: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),  
  };

  const mockFindOne = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    caster<jest.Mock>(getPluginService).mockReturnValue(mockCommonService);
    caster<jest.Mock>(getCommentRepository).mockReturnValue(mockCommentRepository);
    caster<jest.Mock>(getReportCommentRepository).mockReturnValue(mockReportCommentRepository);
  });

  const getStrapi = () => caster<StrapiContext>({
    strapi: {
      contentType: jest.fn().mockReturnValue({ attributes: {} }),
      contentTypes: {},
      documents: jest.fn().mockReturnValue({
        findOne: mockFindOne,
      }),
    },
  });

  const getService = (strapi: StrapiContext) => adminService(strapi);

  describe('findAll', () => {
    it('should return paginated comments with related entities', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockComments = [
        { id: 1, content: 'Comment 1' },
        { id: 2, content: 'Comment 2' },
      ];
      const mockRelatedEntities = [
        { uid: 'api::test.test', documentId: '1', title: 'Test 1' },
      ];

      mockCommentRepository.findWithCount.mockResolvedValue({
        results: mockComments,
        pagination: { page: 1, pageSize: 10, total: 2 },
      });
      mockCommonService.findRelatedEntitiesFor.mockResolvedValue(mockRelatedEntities);
      mockCommonService.sanitizeCommentEntity.mockImplementation(comment => comment);
      mockCommonService.mergeRelatedEntityTo.mockImplementation(comment => comment);

      const result = await service.findAll({ 
        page: 1, 
        pageSize: 10, 
        orderBy: 'created:DESC',
        _q: 'test search',
      });

      expect(result.result).toHaveLength(2);
      expect(result.pagination).toBeDefined();
      expect(mockCommentRepository.findWithCount).toHaveBeenCalledWith({
        count: true,
        orderBy: { created: 'DESC' },
        page: 1,
        pageSize: 10,
        populate: {
          authorUser: true,
          threadOf: {
            populate: {
              authorUser: true,
            },
          },
          reports: {
            where: {
              resolved: false,
            },
          },
        },
        where: {
          content: { $contains: 'test search' },
        },
      });
    });
  });

  describe('findReports', () => {
    it('should return paginated reports', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockReports = [
        { id: 1, related: { id: 1, content: 'Comment 1' } },
        { id: 2, related: { id: 2, content: 'Comment 2' } },
      ];

      mockReportCommentRepository.findPage.mockResolvedValue({
        results: mockReports,
        pagination: { page: 1, pageSize: 10, total: 2 },
      });
      mockCommentRepository.findMany.mockResolvedValue([]);
      mockCommonService.sanitizeCommentEntity.mockImplementation(comment => comment);

      const result = await service.findReports({ 
        page: 1, 
        pageSize: 10,
        orderBy: 'custoOrder:DESC',
      });

      expect(result.result).toHaveLength(2);
      expect(result.pagination).toBeDefined();
      expect(mockReportCommentRepository.findPage).toHaveBeenCalledWith({
        orderBy: { custoOrder: 'DESC' },
        page: 1,
        pageSize: 10,
        populate: ['related'],
        where: {
          resolved: {
            $notNull: true,
          },
        },
      });
    });

    it('should handle custom ordering', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockReports = [
        { id: 1, related: { id: 1, content: 'Comment 1' } },
        { id: 2, related: { id: 2, content: 'Comment 2' } },
      ];

      mockReportCommentRepository.findPage.mockResolvedValue({
        results: mockReports,
        pagination: { page: 1, pageSize: 10, total: 2 },
      });
      mockCommentRepository.findMany.mockResolvedValue([]);
      mockCommonService.sanitizeCommentEntity.mockImplementation(comment => comment);

      const result = await service.findReports({ 
        page: 1, 
        pageSize: 10,
        orderBy: 'resolved:ASC',
      });

      expect(result.result).toHaveLength(2);
      expect(mockReportCommentRepository.findPage).toHaveBeenCalledWith({
        orderBy: { resolved: 'ASC' },
        page: 1,
        pageSize: 10,
        populate: ['related'],
        where: {
          resolved: {
            $notNull: true,
          },
        },
      });
    });
  });

  describe('findOneAndThread', () => {
    it('should return comment with its thread', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockComment = { 
        id: 1, 
        content: 'Test comment',
        related: 'api::test.test:1',
        threadOf: null,
      };
      const mockRelatedEntity = { id: 1, title: 'Test', uid: 'api::test.test' };

      mockCommentRepository.findOne.mockResolvedValue(mockComment);
      mockCommonService.parseRelationString.mockReturnValue({ uid: 'api::test.test', relatedId: '1' });
      mockFindOne.mockResolvedValue(mockRelatedEntity);
      mockCommonService.findAllInHierarchy.mockResolvedValue([]);
      mockCommonService.sanitizeCommentEntity.mockImplementation(comment => comment);

      const result = await service.findOneAndThread({ id: 1 });

      expect(result.entity).toBeDefined();
      expect(result.selected).toBeDefined();
      expect(result.level).toBeDefined();
    });

    it('should throw error when comment not found', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      mockCommentRepository.findOne.mockResolvedValue(null);

      await expect(service.findOneAndThread({ id: 1 })).rejects.toThrow('Not found');
    });
  });

  describe('changeBlockedComment', () => {
    it('should toggle comment blocked status', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockComment = { id: 1, blocked: false };

      mockCommonService.findOne.mockResolvedValue(mockComment);
      mockCommonService.updateComment.mockResolvedValue({ ...mockComment, blocked: true });

      const result = await service.changeBlockedComment(1);

      expect(result.blocked).toBe(true);
      expect(mockCommonService.updateComment).toHaveBeenCalledWith(
        { id: 1 },
        { blocked: true }
      );
    });
  });

  describe('blockCommentThread', () => {
    it('should block comment and its thread', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockComment = { id: 1, blocked: false, blockedThread: false };

      mockCommonService.findOne.mockResolvedValue(mockComment);
      mockCommonService.updateComment.mockResolvedValue({ 
        ...mockComment, 
        blocked: true, 
        blockedThread: true 
      });
      mockCommonService.modifiedNestedNestedComments.mockResolvedValue(true);
      mockCommonService.sanitizeCommentEntity.mockImplementation(comment => comment);

      const result = await service.blockCommentThread(1);

      expect(result.blocked).toBe(true);
      expect(result.blockedThread).toBe(true);
      expect(mockCommonService.modifiedNestedNestedComments).toHaveBeenCalled();
    });
  });

  describe('approveComment', () => {
    it('should approve a comment', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockComment = { id: 1, approvalStatus: APPROVAL_STATUS.PENDING };

      mockCommentRepository.update.mockResolvedValue({
        ...mockComment,
        approvalStatus: APPROVAL_STATUS.APPROVED,
      });
      mockCommonService.sanitizeCommentEntity.mockImplementation(comment => comment);

      const result = await service.approveComment(1);

      expect(result.approvalStatus).toBe(APPROVAL_STATUS.APPROVED);
      expect(mockCommentRepository.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { approvalStatus: APPROVAL_STATUS.APPROVED },
      });
    });

    it('should throw error when comment not found', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      mockCommentRepository.update.mockResolvedValue(null);

      await expect(service.approveComment(1)).rejects.toThrow('Not found');
    });
  });

  describe('resolveAbuseReport', () => {
    it('should resolve abuse report', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockReport = { id: 1, resolved: false };

      mockReportCommentRepository.update.mockResolvedValue({
        ...mockReport,
        resolved: true,
      });

      const result = await service.resolveAbuseReport({
        id: 1,
        reportId: 1,
      });

      expect(result.resolved).toBe(true);
      expect(mockReportCommentRepository.update).toHaveBeenCalled();
    });
  });

  describe('postComment', () => {
    it('should post admin comment', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockComment = { id: 1, content: 'Test comment', related: 'api::test.test:1' };
      const mockAuthor = { id: 1, email: 'admin@test.com' };

      mockCommentRepository.findOne.mockResolvedValue(mockComment);
      mockCommentRepository.create.mockResolvedValue({
        id: 2,
        content: 'Admin reply',
        threadOf: 1,
        isAdminComment: true,
      });

      const result = await service.postComment({
        id: 1,
        content: 'Admin reply',
        author: mockAuthor,
      });

      expect(result.isAdminComment).toBe(true);
      expect(result.threadOf).toBe(1);
      expect(mockCommentRepository.create).toHaveBeenCalled();
    });

    it('should throw error when parent comment not found', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      mockCommentRepository.findOne.mockResolvedValue(null);

      await expect(service.postComment({
        id: 1,
        content: 'Admin reply',
        author: { id: 1, email: 'admin@test.com' },
      })).rejects.toThrow('Not found');
    });
  });

  describe('deleteComment', () => {
    it('should mark comment as removed', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockComment = { id: 1, removed: false };

      mockCommentRepository.update.mockResolvedValue({
        ...mockComment,
        removed: true,
      });

      const result = await service.deleteComment(1);

      expect(result.removed).toBe(true);
      expect(mockCommentRepository.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { removed: true },
      });
    });

    it('should handle non-existent comment', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      mockCommentRepository.update.mockResolvedValue(null);

      const result = await service.deleteComment(1);

      expect(result).toBeNull();
      expect(mockCommentRepository.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { removed: true },
      });
    });
  });

  describe('rejectComment', () => {
    it('should reject a comment', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockComment = { id: 1, approvalStatus: APPROVAL_STATUS.PENDING };

      mockCommentRepository.update.mockResolvedValue({
        ...mockComment,
        approvalStatus: APPROVAL_STATUS.REJECTED,
      });
      mockCommonService.sanitizeCommentEntity.mockImplementation(comment => comment);

      const result = await service.rejectComment(1);

      expect(result.approvalStatus).toBe(APPROVAL_STATUS.REJECTED);
      expect(mockCommentRepository.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { approvalStatus: APPROVAL_STATUS.REJECTED },
      });
    });

    it('should throw error when comment not found', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      mockCommentRepository.update.mockResolvedValue(null);

      await expect(service.rejectComment(1)).rejects.toThrow('Not found');
    });
  });

  describe('updateComment', () => {
    it('should update a comment content', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockComment = { id: 1, content: 'Old content' };

      mockCommentRepository.update.mockResolvedValue({
        ...mockComment,
        content: 'Updated content',
      });
      mockCommonService.sanitizeCommentEntity.mockImplementation(comment => comment);

      const result = await service.updateComment({
        id: 1,
        content: 'Updated content',
      });

      expect(result.content).toBe('Updated content');
      expect(mockCommentRepository.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { content: 'Updated content' },
      });
    });

    it('should throw error when comment not found', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      mockCommentRepository.update.mockResolvedValue(null);

      await expect(service.updateComment({
        id: 1,
        content: 'Updated content',
      })).rejects.toThrow('Not found');
    });
  });

  describe('resolveCommentMultipleAbuseReports', () => {
    it('should resolve multiple abuse reports for a comment', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockReports = [
        { id: 1, related: { id: 1 } },
        { id: 2, related: { id: 1 } },
      ];

      mockReportCommentRepository.findMany.mockResolvedValue(mockReports);
      mockReportCommentRepository.updateMany.mockResolvedValue({ count: 2 });

      const result = await service.resolveCommentMultipleAbuseReports({
        id: 1,
        reportIds: [1, 2],
      });

      expect(result.count).toBe(2);
      expect(mockReportCommentRepository.findMany).toHaveBeenCalledWith({
        where: {
          id: [1, 2],
          related: 1,
        },
        populate: ['related'],
      });
      expect(mockReportCommentRepository.updateMany).toHaveBeenCalledWith({
        where: {
          id: [1, 2],
        },
        data: {
          resolved: true,
        },
      });
    });

    it('should throw error when reports have invalid comment relation', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockReports = [
        { id: 1, related: { id: 1 } },
      ];

      mockReportCommentRepository.findMany.mockResolvedValue(mockReports);

      await expect(service.resolveCommentMultipleAbuseReports({
        id: 1,
        reportIds: [1, 2],
      })).rejects.toThrow('At least one of selected reports got invalid comment entity relation');
    });
  });

  describe('resolveAllAbuseReportsForComment', () => {
    it('should resolve all abuse reports for a comment', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      mockReportCommentRepository.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.resolveAllAbuseReportsForComment(1);

      expect(result.count).toBe(3);
      expect(mockReportCommentRepository.updateMany).toHaveBeenCalledWith({
        where: {
          related: 1,
          resolved: false,
        },
        data: {
          resolved: true,
        },
      });
    });

    it('should throw error when comment id is not provided', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      await expect(service.resolveAllAbuseReportsForComment(null)).rejects.toThrow(
        'There is something wrong with comment Id'
      );
    });
  });

  describe('resolveAllAbuseReportsForThread', () => {
    it('should resolve all abuse reports for a comment thread', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockThreadComments = [
        { id: 2 },
        { id: 3 },
      ];

      mockCommentRepository.findMany.mockResolvedValue(mockThreadComments);
      mockReportCommentRepository.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.resolveAllAbuseReportsForThread(1);

      expect(result.count).toBe(3);
      expect(mockCommentRepository.findMany).toHaveBeenCalledWith({
        where: {
          threadOf: 1,
        },
        select: ['id'],
      });
      expect(mockReportCommentRepository.updateMany).toHaveBeenCalledWith({
        where: {
          related: [2, 3, 1],
          resolved: false,
        },
        data: {
          resolved: true,
        },
      });
    });

    it('should throw error when comment id is not provided', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      await expect(service.resolveAllAbuseReportsForThread(null)).rejects.toThrow(
        'There is something wrong with comment Id'
      );
    });

    it('should handle thread with no comments', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      mockCommentRepository.findMany.mockResolvedValue([]);
      mockReportCommentRepository.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.resolveAllAbuseReportsForThread(1);

      expect(result.count).toBe(1);
      expect(mockReportCommentRepository.updateMany).toHaveBeenCalledWith({
        where: {
          related: [1],
          resolved: false,
        },
        data: {
          resolved: true,
        },
      });
    });
  });

  describe('resolveMultipleAbuseReports', () => {
    it('should resolve multiple abuse reports', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const reportIds = [1, 2, 3];

      mockReportCommentRepository.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.resolveMultipleAbuseReports({
        reportIds,
      });

      expect(result.count).toBe(3);
      expect(mockReportCommentRepository.updateMany).toHaveBeenCalledWith({
        where: {
          id: { $in: reportIds },
        },
        data: {
          resolved: true,
        },
      });
    });

    it('should handle empty report ids array', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      mockReportCommentRepository.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.resolveMultipleAbuseReports({
        reportIds: [],
      });

      expect(result.count).toBe(0);
      expect(mockReportCommentRepository.updateMany).toHaveBeenCalledWith({
        where: {
          id: { $in: [] },
        },
        data: {
          resolved: true,
        },
      });
    });
  });
});
