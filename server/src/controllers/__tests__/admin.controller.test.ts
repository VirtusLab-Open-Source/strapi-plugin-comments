import { RequestContext, StrapiContext } from '../../@types';
import { caster } from '../../test/utils';
import { getPluginService } from '../../utils/getPluginService';
import { admin as adminValidator } from '../../validators/api';
import controllers from '../admin.controller';

jest.mock('../../utils/getPluginService', () => ({
  getPluginService: jest.fn(),
}));

const mockCommentRepository = {};
jest.mock('../../repositories', () => ({
  getCommentRepository: jest.fn(() => mockCommentRepository),
}));

jest.mock('../../validators/api', () => ({
  admin: {
    getCommentFindAllValidator: jest.fn(),
    getReportFindReportsValidator: jest.fn(),
    getCommentFindOneValidator: jest.fn(),
    getIdValidator: jest.fn(),
    getCommentResolveAbuseReportValidator: jest.fn(),
    getCommentResolveMultipleAbuseReportsValidator: jest.fn(),
    getReportsMultipleAbuseValidator: jest.fn(),
    getCommentPostValidator: jest.fn(),
    getUpdateCommentValidator: jest.fn(),
  },
}));

describe('Admin controller', () => {
  const mockAdminService = {
    findAll: jest.fn(),
    findReports: jest.fn(),
    findOneAndThread: jest.fn(),
    changeBlockedComment: jest.fn(),
    blockCommentThread: jest.fn(),
    deleteComment: jest.fn(),
    resolveAbuseReport: jest.fn(),
    resolveCommentMultipleAbuseReports: jest.fn(),
    resolveAllAbuseReportsForComment: jest.fn(),
    resolveAllAbuseReportsForThread: jest.fn(),
    resolveMultipleAbuseReports: jest.fn(),
    postCommentThread: jest.fn(),
    updateComment: jest.fn(),
    approveComment: jest.fn(),
    rejectComment: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    caster<jest.Mock>(getPluginService).mockReturnValue(mockAdminService);
  });

  const getStrapi = () => caster<StrapiContext>({ strapi: {} });
  const getController = (strapi: StrapiContext) => controllers(strapi);

  describe('findAll', () => {
    it('should return comments when validation passes', async () => {
      const ctx = { query: { page: 1 } } as RequestContext;
      const validatedData = { page: 1 };
      const expectedResult = [{ id: 1, content: 'Test comment' }];

      caster<jest.Mock>(adminValidator.getCommentFindAllValidator).mockReturnValue({ right: validatedData });
      mockAdminService.findAll.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).findAll(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockAdminService.findAll).toHaveBeenCalledWith(validatedData, mockCommentRepository);
    });

    it('should throw error when validation fails', async () => {
      const ctx = { query: {} } as RequestContext;
      const error = new Error('Validation failed');

      caster<jest.Mock>(adminValidator.getCommentFindAllValidator).mockReturnValue({ left: error });

      await expect(getController(getStrapi()).findAll(ctx)).rejects.toThrow();
    });
  });

  describe('findReports', () => {
    it('should return reports when validation passes', async () => {
      const ctx = { query: { page: 1 } } as RequestContext;
      const validatedData = { page: 1 };
      const expectedResult = [{ id: 1, reason: 'Test report' }];

      caster<jest.Mock>(adminValidator.getReportFindReportsValidator).mockReturnValue({ right: validatedData });
      mockAdminService.findReports.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).findReports(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockAdminService.findReports).toHaveBeenCalledWith(validatedData, mockCommentRepository);
    });

    it('should throw error when validation fails', async () => {
      const ctx = { query: {} } as RequestContext;
      const error = new Error('Validation failed');

      caster<jest.Mock>(adminValidator.getReportFindReportsValidator).mockReturnValue({ left: error });

      await expect(getController(getStrapi()).findReports(ctx)).rejects.toThrow();
    });
  });

  describe('findOne', () => {
    it('should return comment with thread when validation passes', async () => {
      const ctx = { 
        params: { id: '1' },
        query: { populate: ['thread'] }
      } as RequestContext<object, { id: string }>;
      const validatedData = { id: '1', populate: ['thread'] };
      const expectedResult = { 
        id: 1, 
        content: 'Test comment',
        thread: [
          { id: 2, content: 'Reply comment' }
        ]
      };

      caster<jest.Mock>(adminValidator.getCommentFindOneValidator).mockReturnValue({ right: validatedData });
      mockAdminService.findOneAndThread.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).findOne(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockAdminService.findOneAndThread).toHaveBeenCalledWith(validatedData, mockCommentRepository);
    });

    it('should throw error when validation fails', async () => {
      const ctx = { 
        params: { id: 'invalid' },
        query: {}
      } as RequestContext<object, { id: string }>;
      const error = new Error('Validation failed');

      caster<jest.Mock>(adminValidator.getCommentFindOneValidator).mockReturnValue({ left: error });

      await expect(getController(getStrapi()).findOne(ctx)).rejects.toThrow();
    });
  });

  describe('blockComment', () => {
    it('should block comment when validation passes', async () => {
      const ctx = { params: { id: '1' } } as RequestContext<object, { id: string }>;
      const validatedData = { id: '1' };
      const expectedResult = { id: 1, blocked: true };

      caster<jest.Mock>(adminValidator.getIdValidator).mockReturnValue({ right: validatedData });
      mockAdminService.changeBlockedComment.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).blockComment(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockAdminService.changeBlockedComment).toHaveBeenCalledWith('1', true);
    });

    it('should throw error when validation fails', async () => {
      const ctx = { params: { id: 'invalid' } } as RequestContext<object, { id: string }>;
      const error = new Error('Validation failed');

      caster<jest.Mock>(adminValidator.getIdValidator).mockReturnValue({ left: error });

      await expect(getController(getStrapi()).blockComment(ctx)).rejects.toThrow();
    });
  });

  describe('resolveAbuseReport', () => {
    it('should resolve abuse report when validation passes', async () => {
      const ctx = { params: { id: '1', reportId: '2' } } as RequestContext<object, { id: string, reportId: string }>;
      const validatedData = { id: '1', reportId: '2' };
      const expectedResult = { success: true };

      caster<jest.Mock>(adminValidator.getCommentResolveAbuseReportValidator).mockReturnValue({ right: validatedData });
      mockAdminService.resolveAbuseReport.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).resolveAbuseReport(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockAdminService.resolveAbuseReport).toHaveBeenCalledWith(validatedData);
    });

    it('should throw error when validation fails', async () => {
      const ctx = { params: { id: 'invalid', reportId: '2' } } as RequestContext<object, { id: string; reportId: string }>;
      const error = new Error('Validation failed');

      caster<jest.Mock>(adminValidator.getCommentResolveAbuseReportValidator).mockReturnValue({ left: error });

      await expect(getController(getStrapi()).resolveAbuseReport(ctx)).rejects.toThrow();
    });
  });

  describe('resolveCommentMultipleAbuseReports', () => {
    it('should resolve multiple abuse reports for a comment when validation passes', async () => {
      const reportIds = ['1', '2', '3'];
      const ctx = {
        params: { id: '1' },
        request: { body: reportIds }
      } as RequestContext<Array<string>, { id: string }>;
      const validatedData = { id: '1', reportIds };
      const expectedResult = { success: true };

      caster<jest.Mock>(adminValidator.getCommentResolveMultipleAbuseReportsValidator).mockReturnValue({ right: validatedData });
      mockAdminService.resolveCommentMultipleAbuseReports.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).resolveCommentMultipleAbuseReports(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockAdminService.resolveCommentMultipleAbuseReports).toHaveBeenCalledWith(validatedData);
    });

    it('should throw error when validation fails', async () => {
      const reportIds = ['invalid'];
      const ctx = {
        params: { id: '1' },
        request: { body: reportIds }
      } as RequestContext<Array<string>, { id: string }>;
      const error = new Error('Validation failed');

      caster<jest.Mock>(adminValidator.getCommentResolveMultipleAbuseReportsValidator).mockReturnValue({ left: error });

      await expect(getController(getStrapi()).resolveCommentMultipleAbuseReports(ctx)).rejects.toThrow();
    });
  });

  describe('postCommentThread', () => {
    it('should post comment to thread when validation passes', async () => {
      const ctx = {
        params: { id: '1' },
        request: { body: { content: 'Test content', author: 'Test author' } }
      } as RequestContext<any, any>;
      const validatedData = { id: '1', content: 'Test content', author: 'Test author' };
      const expectedResult = { id: 1, content: 'Test content' };

      caster<jest.Mock>(adminValidator.getCommentPostValidator).mockReturnValue({ right: validatedData });
      mockAdminService.postCommentThread.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).postCommentThread(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockAdminService.postCommentThread).toHaveBeenCalledWith(validatedData, mockCommentRepository);
    });

    it('should throw error when validation fails', async () => {
      const ctx = {
        params: { id: '1' },
        request: { body: { content: 'Test content', author: 'Test author' } }
      } as RequestContext<any, any>;
      const error = new Error('Validation failed');

      caster<jest.Mock>(adminValidator.getCommentPostValidator).mockReturnValue({ left: error });

      await expect(getController(getStrapi()).postCommentThread(ctx)).rejects.toThrow();
    });
  });

  describe('unblockComment', () => {
    it('should unblock comment when validation passes', async () => {
      const ctx = { params: { id: '1' } } as RequestContext<object, { id: string }>;
      const validatedData = { id: '1' };
      const expectedResult = { id: 1, blocked: false };

      caster<jest.Mock>(adminValidator.getIdValidator).mockReturnValue({ right: validatedData });
      mockAdminService.changeBlockedComment.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).unblockComment(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockAdminService.changeBlockedComment).toHaveBeenCalledWith('1', false);
    });

    it('should throw error when validation fails', async () => {
      const ctx = { params: { id: 'invalid' } } as RequestContext<object, { id: string }>;
      const error = new Error('Validation failed');

      caster<jest.Mock>(adminValidator.getIdValidator).mockReturnValue({ left: error });

      await expect(getController(getStrapi()).unblockComment(ctx)).rejects.toThrow();
    });
  });

  describe('deleteComment', () => {
    it('should delete comment when validation passes', async () => {
      const ctx = { params: { id: '1' } } as RequestContext<object, { id: string }>;
      const validatedData = { id: '1' };
      const expectedResult = { success: true };

      caster<jest.Mock>(adminValidator.getIdValidator).mockReturnValue({ right: validatedData });
      mockAdminService.deleteComment.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).deleteComment(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockAdminService.deleteComment).toHaveBeenCalledWith('1', mockCommentRepository);
    });

    it('should throw error when validation fails', async () => {
      const ctx = { params: { id: 'invalid' } } as RequestContext<object, { id: string }>;
      const error = new Error('Validation failed');

      caster<jest.Mock>(adminValidator.getIdValidator).mockReturnValue({ left: error });

      await expect(getController(getStrapi()).deleteComment(ctx)).rejects.toThrow();
    });
  });

  describe('blockCommentThread', () => {
    it('should block comment thread when validation passes', async () => {
      const ctx = { params: { id: '1' } } as RequestContext<object, { id: string }>;
      const validatedData = { id: '1' };
      const expectedResult = { success: true };

      caster<jest.Mock>(adminValidator.getIdValidator).mockReturnValue({ right: validatedData });
      mockAdminService.blockCommentThread.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).blockCommentThread(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockAdminService.blockCommentThread).toHaveBeenCalledWith('1', true);
    });

    it('should throw error when validation fails', async () => {
      const ctx = { params: { id: 'invalid' } } as RequestContext<object, { id: string }>;
      const error = new Error('Validation failed');

      caster<jest.Mock>(adminValidator.getIdValidator).mockReturnValue({ left: error });

      await expect(getController(getStrapi()).blockCommentThread(ctx)).rejects.toThrow();
    });
  });

  describe('unblockCommentThread', () => {
    it('should unblock comment thread when validation passes', async () => {
      const ctx = { params: { id: '1' } } as RequestContext<object, { id: string }>;
      const validatedData = { id: '1' };
      const expectedResult = { success: true };

      caster<jest.Mock>(adminValidator.getIdValidator).mockReturnValue({ right: validatedData });
      mockAdminService.blockCommentThread.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).unblockCommentThread(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockAdminService.blockCommentThread).toHaveBeenCalledWith('1', false);
    });

    it('should throw error when validation fails', async () => {
      const ctx = { params: { id: 'invalid' } } as RequestContext<object, { id: string }>;
      const error = new Error('Validation failed');

      caster<jest.Mock>(adminValidator.getIdValidator).mockReturnValue({ left: error });

      await expect(getController(getStrapi()).unblockCommentThread(ctx)).rejects.toThrow();
    });
  });

  describe('resolveAllAbuseReportsForComment', () => {
    it('should resolve all abuse reports for comment when validation passes', async () => {
      const ctx = { params: { id: '1' } } as RequestContext<object, { id: string }>;
      const validatedData = { id: '1' };
      const expectedResult = { success: true };

      caster<jest.Mock>(adminValidator.getIdValidator).mockReturnValue({ right: validatedData });
      mockAdminService.resolveAllAbuseReportsForComment.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).resolveAllAbuseReportsForComment(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockAdminService.resolveAllAbuseReportsForComment).toHaveBeenCalledWith('1');
    });

    it('should throw error when validation fails', async () => {
      const ctx = { params: { id: 'invalid' } } as RequestContext<object, { id: string }>;
      const error = new Error('Validation failed');

      caster<jest.Mock>(adminValidator.getIdValidator).mockReturnValue({ left: error });

      await expect(getController(getStrapi()).resolveAllAbuseReportsForComment(ctx)).rejects.toThrow();
    });
  });

  describe('resolveAllAbuseReportsForThread', () => {
    it('should resolve all abuse reports for thread when validation passes', async () => {
      const ctx = { params: { id: '1' } } as RequestContext<object, { id: string }>;
      const validatedData = { id: '1' };
      const expectedResult = { success: true };

      caster<jest.Mock>(adminValidator.getIdValidator).mockReturnValue({ right: validatedData });
      mockAdminService.resolveAllAbuseReportsForThread.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).resolveAllAbuseReportsForThread(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockAdminService.resolveAllAbuseReportsForThread).toHaveBeenCalledWith('1', mockCommentRepository);
    });

    it('should throw error when validation fails', async () => {
      const ctx = { params: { id: 'invalid' } } as RequestContext<object, { id: string }>;
      const error = new Error('Validation failed');

      caster<jest.Mock>(adminValidator.getIdValidator).mockReturnValue({ left: error });

      await expect(getController(getStrapi()).resolveAllAbuseReportsForThread(ctx)).rejects.toThrow();
    });
  });

  describe('resolveMultipleAbuseReports', () => {
    it('should resolve multiple abuse reports when validation passes', async () => {
      const reportIds = ['1', '2'];
      const ctx = { request: { body: reportIds } } as RequestContext<Array<string>>;
      const validatedData = reportIds;
      const expectedResult = { success: true };

      caster<jest.Mock>(adminValidator.getReportsMultipleAbuseValidator).mockReturnValue({ right: validatedData });
      mockAdminService.resolveMultipleAbuseReports.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).resolveMultipleAbuseReports(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockAdminService.resolveMultipleAbuseReports).toHaveBeenCalledWith(reportIds);
    });

    it('should throw error when validation fails', async () => {
      const reportIds = ['invalid'];
      const ctx = { request: { body: reportIds } } as RequestContext<Array<string>>;
      const error = new Error('Validation failed');

      caster<jest.Mock>(adminValidator.getReportsMultipleAbuseValidator).mockReturnValue({ left: error });

      await expect(getController(getStrapi()).resolveMultipleAbuseReports(ctx)).rejects.toThrow();
    });
  });

  describe('updateComment', () => {
    it('should update comment when validation passes', async () => {
      const ctx = {
        params: { id: '1' },
        request: { body: { content: 'Updated content' } }
      } as RequestContext<any, any>;
      const validatedData = { id: '1', content: 'Updated content' };
      const expectedResult = { id: 1, content: 'Updated content' };

      caster<jest.Mock>(adminValidator.getUpdateCommentValidator).mockReturnValue({ right: validatedData });
      mockAdminService.updateComment.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).updateComment(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockAdminService.updateComment).toHaveBeenCalledWith(validatedData, mockCommentRepository);
    });

    it('should throw error when validation fails', async () => {
      const ctx = {
        params: { id: '1' },
        request: { body: { content: '' } }
      } as RequestContext<any, any>;
      const error = new Error('Validation failed');

      caster<jest.Mock>(adminValidator.getUpdateCommentValidator).mockReturnValue({ left: error });

      await expect(getController(getStrapi()).updateComment(ctx)).rejects.toThrow();
    });
  });

  describe('approveComment', () => {
    it('should approve comment when validation passes', async () => {
      const ctx = { params: { id: 1 } } as RequestContext<object, { id: number }>;
      const validatedData = { id: '1' };
      const expectedResult = { id: 1, approved: true };

      caster<jest.Mock>(adminValidator.getIdValidator).mockReturnValue({ right: validatedData });
      mockAdminService.approveComment.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).approveComment(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockAdminService.approveComment).toHaveBeenCalledWith('1', mockCommentRepository);
    });

    it('should throw error when validation fails', async () => {
      const ctx = { params: { id: 'invalid' } } as RequestContext<any, any>;
      const error = new Error('Validation failed');

      caster<jest.Mock>(adminValidator.getIdValidator).mockReturnValue({ left: error });

      await expect(getController(getStrapi()).approveComment(ctx)).rejects.toThrow();
    });
  });

  describe('rejectComment', () => {
    it('should reject comment when validation passes', async () => {
      const ctx = { params: { id: 1 } } as RequestContext<object, { id: number }>;
      const validatedData = { id: '1' };
      const expectedResult = { id: 1, rejected: true };

      caster<jest.Mock>(adminValidator.getIdValidator).mockReturnValue({ right: validatedData });
      mockAdminService.rejectComment.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).rejectComment(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockAdminService.rejectComment).toHaveBeenCalledWith('1', mockCommentRepository);
    });

    it('should throw error when validation fails', async () => {
      const ctx = { params: { id: 'invalid' } } as RequestContext<any, any>;
      const error = new Error('Validation failed');

      caster<jest.Mock>(adminValidator.getIdValidator).mockReturnValue({ left: error });

      await expect(getController(getStrapi()).rejectComment(ctx)).rejects.toThrow();
    });
  });
});