import { cloneDeep } from 'lodash';
import { RequestContext, StrapiContext } from '../../@types';
import { getStoreRepository } from '../../repositories';
import { caster } from '../../test/utils';
import { AUTHOR_TYPE } from '../../utils/constants';
import { getPluginService } from '../../utils/getPluginService';
import { client as clientValidator } from '../../validators/api';
import controllers from '../client.controller';

jest.mock('../../utils/getPluginService', () => ({
  getPluginService: jest.fn(),
}));

jest.mock('../../repositories', () => ({
  getStoreRepository: jest.fn(),
}));

jest.mock('../../validators/api', () => ({
  client: {
    newCommentValidator: jest.fn(),
    findAllFlatValidator: jest.fn(),
    findAllInHierarchyValidator: jest.fn(),
    findAllPerAuthorValidator: jest.fn(),
    updateCommentValidator: jest.fn(),
    reportAbuseValidator: jest.fn(),
    removeCommentValidator: jest.fn(),
    changeBlockedCommentValidator: jest.fn(),
    resolveAbuseReportValidator: jest.fn(),
    resolveCommentMultipleAbuseReportsValidator: jest.fn(),
    resolveMultipleAbuseReportsValidator: jest.fn(),
  },
}));

describe('Client controller', () => {
  const mockClientService = {
    create: jest.fn(),
    update: jest.fn(),
    reportAbuse: jest.fn(),
    markAsRemoved: jest.fn(),
  };

  const mockCommonService = {
    findAllFlat: jest.fn(),
    findAllInHierarchy: jest.fn(),
    findAllPerAuthor: jest.fn(),
    changeBlockedComment: jest.fn(),
    changeBlockedCommentThread: jest.fn(),
    approveComment: jest.fn(),
    rejectComment: jest.fn(),
  };

  const mockAdminService = {
    resolveAbuseReport: jest.fn(),
    resolveCommentMultipleAbuseReports: jest.fn(),
    resolveAllAbuseReportsForComment: jest.fn(),
    resolveAllAbuseReportsForThread: jest.fn(),
    resolveMultipleAbuseReports: jest.fn(),
  };

  const mockStoreRepository = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    caster<jest.Mock>(getPluginService)
      .mockImplementation((_, name) => {
        if (name === 'client') return mockClientService;
        if (name === 'common') return mockCommonService;
        if (name === 'admin') return mockAdminService;
        return null;
      });
    caster<jest.Mock>(getStoreRepository).mockReturnValue(mockStoreRepository);
  });

  const getStrapi = () => caster<StrapiContext>({ strapi: {} });
  const getController = (strapi: StrapiContext) => controllers(strapi);

  describe('post', () => {
    it('should create a comment when validation passes', async () => {
      const ctx = {
        params: { relation: 'test' },
        request: { body: { content: 'Test comment' } },
        state: { user: { id: 1 } }
      } as RequestContext;
      const config = { enabledCollections: ['test'] };
      const validatedData = { content: 'Test comment', relation: 'test' };
      const expectedResult = { id: 1, content: 'Test comment' };

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.newCommentValidator).mockReturnValue({ right: validatedData });
      mockClientService.create.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).post(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockClientService.create).toHaveBeenCalledWith(validatedData, { id: 1 });
    });

    it('should throw error when store config validation fails', async () => {
      const ctx = {
        params: { relation: 'test' },
        request: { body: {} }
      } as RequestContext;
      const error = new Error('Config validation failed');

      mockStoreRepository.get.mockResolvedValue({ left: error });

      await expect(getController(getStrapi()).post(ctx)).rejects.toThrow();
    });

    it('should throw error when newCommentValidator fails', async () => {
      const ctx = {
        params: { relation: 'test' },
        request: { body: {} },
        state: { user: { id: 1 } }
      } as RequestContext;
      const config = { enabledCollections: ['test'] };
      const error = new Error('Validation failed');

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.newCommentValidator).mockReturnValue({ left: error });

      await expect(getController(getStrapi()).post(ctx)).rejects.toThrow();
    });
  });

  describe('findAllFlat', () => {
    it('should return flat comments when validation passes', async () => {
      const ctx = {
        params: { relation: 'test' },
        query: { page: 1 }
      } as RequestContext;
      const config = { enabledCollections: ['test'] };
      const validatedData = { 
        relation: 'test', 
        page: 1,
        filters: {
            $or: [
                { removed: { $null: true } },
                { removed: false }
            ],
            related: 'test', 
        },
      };
      const expectedResult = [{ id: 1, content: 'Test comment' }];

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.findAllFlatValidator).mockReturnValue({ right: cloneDeep(validatedData) });
      mockCommonService.findAllFlat.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).findAllFlat(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockCommonService.findAllFlat).toHaveBeenCalledWith({
        ...validatedData,
        populate: {
          reports: {
            where: {
              resolved: false,
            },
          },
          threadOf: {
            populate: {
              authorUser: {
                populate: true,
                avatar: { populate: true },
              },
            }
          }
        }
      });
    });

    it('should throw error when store config validation fails', async () => {
      const ctx = {
        params: { relation: 'test' },
        query: { page: 1 }
      } as RequestContext;
      const error = new Error('Config validation failed');

      mockStoreRepository.get.mockResolvedValue({ left: error });

      await expect(getController(getStrapi()).findAllFlat(ctx)).rejects.toThrow();
    });

    it('should throw error when findAllFlatValidator fails', async () => {
      const ctx = {
        params: { relation: 'test' },
        query: { page: 1 }
      } as RequestContext;
      const config = { enabledCollections: ['test'] };
      const error = new Error('Validation failed');

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.findAllFlatValidator).mockReturnValue({ left: error });

      await expect(getController(getStrapi()).findAllFlat(ctx)).rejects.toThrow();
    });
  });

  describe('findAllInHierarchy', () => {
    it('should return hierarchical comments when validation passes', async () => {
      const ctx = {
        params: { relation: 'test' },
        query: { page: 1 }
      } as RequestContext;
      const config = { enabledCollections: ['test'] };
      const validatedData = { 
        relation: 'test',
        page: 1,
        filters: {
            $or: [
                { removed: { $null: true } },
                { removed: false }
            ],
            related: 'test', 
        },
      };
      const expectedResult = [{ 
        id: 1, 
        content: 'Test comment',
        replies: [{ id: 2, content: 'Reply' }]
      }];

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.findAllInHierarchyValidator).mockReturnValue({ right: cloneDeep(validatedData) });
      mockCommonService.findAllInHierarchy.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).findAllInHierarchy(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockCommonService.findAllInHierarchy).toHaveBeenCalledWith({
        ...validatedData,
        populate: {
          reports: {
            where: {
              resolved: false,
            },
          },
          threadOf: {
            populate: {
              authorUser: {
                populate: true,
                avatar: { populate: true },
              },
            }
          }
        }
      });
    });

    it('should throw error when store config validation fails', async () => {
      const ctx = {
        params: { relation: 'test' },
        query: { page: 1 }
      } as RequestContext;
      const error = new Error('Config validation failed');

      mockStoreRepository.get.mockResolvedValue({ left: error });

      await expect(getController(getStrapi()).findAllInHierarchy(ctx)).rejects.toThrow();
    });

    it('should throw error when findAllInHierarchyValidator fails', async () => {
      const ctx = {
        params: { relation: 'test' },
        query: { page: 1 }
      } as RequestContext;
      const config = { enabledCollections: ['test'] };
      const error = new Error('Validation failed');

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.findAllInHierarchyValidator).mockReturnValue({ left: error });

      await expect(getController(getStrapi()).findAllInHierarchy(ctx)).rejects.toThrow();
    });
  });

  describe('findAllPerAuthor', () => {
    it('should return author comments when validation passes', async () => {
      const ctx = {
        params: { authorId: '1', type: 'user' },
        query: { page: 1 }
      } as RequestContext;
      const validatedData = { 
        authorId: '1', 
        type: 'user',
        page: 1,
        filters: {
            $or: [
                { removed: { $null: true } },
                { removed: false }
            ],
        },
      };
      const expectedResult = [{ id: 1, content: 'Test comment', authorId: '1' }];

      caster<jest.Mock>(clientValidator.findAllPerAuthorValidator).mockReturnValue({ right: validatedData });
      mockCommonService.findAllPerAuthor.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).findAllPerAuthor(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockCommonService.findAllPerAuthor).toHaveBeenCalledWith({
        ...validatedData,
        populate: {
          reports: {
            where: {
              resolved: false,
            },
          },
          threadOf: {
            populate: {
              authorUser: {
                populate: true,
                avatar: { populate: true },
              },
            }
          }
        }
      }, true);
    });

    it('should pass false when type is not provided', async () => {
      const ctx = {
        params: { authorId: '1' },
        query: { page: 1 }
      } as RequestContext;
      const validatedData = {
        authorId: '1',
        page: 1,
        filters: {
          $or: [
            { removed: { $null: true } },
            { removed: false }
          ],
        },
      };

      caster<jest.Mock>(clientValidator.findAllPerAuthorValidator).mockReturnValue({ right: validatedData });
      mockCommonService.findAllPerAuthor.mockResolvedValue([]);

      await getController(getStrapi()).findAllPerAuthor(ctx);

      expect(mockCommonService.findAllPerAuthor).toHaveBeenCalledWith(
        expect.anything(),
        false,
      );
    });

    it('should pass false when type is generic (lowercase)', async () => {
      const ctx = {
        params: { authorId: '1', type: 'generic' },
        query: { page: 1 }
      } as RequestContext;
      const validatedData = {
        authorId: '1',
        type: 'generic',
        page: 1,
        filters: {
          $or: [
            { removed: { $null: true } },
            { removed: false }
          ],
        },
      };

      caster<jest.Mock>(clientValidator.findAllPerAuthorValidator).mockReturnValue({ right: validatedData });
      mockCommonService.findAllPerAuthor.mockResolvedValue([]);

      await getController(getStrapi()).findAllPerAuthor(ctx);

      expect(mockCommonService.findAllPerAuthor).toHaveBeenCalledWith(
        expect.anything(),
        false,
      );
    });

    it('should handle generic author type correctly', async () => {
      const ctx = {
        params: { authorId: '1', type: AUTHOR_TYPE.GENERIC },
        query: { page: 1 }
      } as RequestContext;
      const validatedData = { 
        authorId: '1',
        type: AUTHOR_TYPE.GENERIC,
        page: 1,
        filters: {
            $or: [
                { removed: { $null: true } },
                { removed: false }
            ],
        },
      };

      caster<jest.Mock>(clientValidator.findAllPerAuthorValidator).mockReturnValue({ right: cloneDeep(validatedData) });
      await getController(getStrapi()).findAllPerAuthor(ctx);

      expect(mockCommonService.findAllPerAuthor).toHaveBeenCalledWith({
        ...validatedData,
        populate: {
          reports: {
            where: {
              resolved: false,
            },
          },
          threadOf: {
            populate: {
              authorUser: {
                populate: true,
                avatar: { populate: true },
              },
            }
          }
        }
      }, false);
    });

    it('should throw error when findAllPerAuthorValidator fails', async () => {
      const ctx = {
        params: { authorId: '1', type: 'user' },
        query: { page: 1 }
      } as RequestContext;
      const error = new Error('Validation failed');

      caster<jest.Mock>(clientValidator.findAllPerAuthorValidator).mockReturnValue({ left: error });

      await expect(getController(getStrapi()).findAllPerAuthor(ctx)).rejects.toThrow();
    });
  });

  describe('put', () => {
    it('should update comment when validation passes', async () => {
      const ctx = {
        params: { id: '1' },
        query: {},
        state: { user: { id: 1 } },
        request: { body: { content: 'Updated content' } }
      } as RequestContext<{ content: string; author: unknown }>;
      const config = { enabledCollections: ['test'] };
      const validatedData = { id: '1', content: 'Updated content' };
      const expectedResult = { id: 1, content: 'Updated content' };

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.updateCommentValidator).mockReturnValue({ right: validatedData });
      mockClientService.update.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).put(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockClientService.update).toHaveBeenCalledWith(validatedData, { id: 1 });
    });

    it('should throw error when store config validation fails', async () => {
      const ctx = {
        params: { id: '1' },
        query: {},
        state: { user: { id: 1 } },
        request: { body: { content: 'Updated content' } }
      } as RequestContext<{ content: string; author: unknown }>;
      const error = new Error('Config validation failed');

      mockStoreRepository.get.mockResolvedValue({ left: error });

      await expect(getController(getStrapi()).put(ctx)).rejects.toThrow();
    });

    it('should throw error when comment validation fails', async () => {
      const ctx = {
        params: { id: '1' },
        query: {},
        state: { user: { id: 1 } },
        request: { body: { content: '' } }
      } as RequestContext<{ content: string; author: unknown }>;
      const config = { enabledCollections: ['test'] };
      const validationError = new Error('Content cannot be empty');

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.updateCommentValidator).mockReturnValue({ left: validationError });

      await expect(getController(getStrapi()).put(ctx)).rejects.toThrow();
    });

    it('should update comment with custom author when provided', async () => {
      const ctx = {
        params: { id: '1' },
        query: {},
        state: { user: { id: 1 } },
        request: { body: { content: 'Updated content', author: { name: 'Custom Author' } } }
      } as RequestContext<{ content: string; author: unknown }>;
      const config = { enabledCollections: ['test'] };
      const validatedData = { 
        id: '1', 
        content: 'Updated content',
        author: { name: 'Custom Author' }
      };
      const expectedResult = { 
        id: 1, 
        content: 'Updated content',
        author: { name: 'Custom Author' }
      };

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.updateCommentValidator).mockReturnValue({ right: validatedData });
      mockClientService.update.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).put(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockClientService.update).toHaveBeenCalledWith(validatedData, { id: 1 });
    });

    it('should handle update with empty request body', async () => {
      const ctx = {
        params: { id: '1' },
        query: {},
        state: { user: { id: 1 } },
        request: { body: {} }
      } as RequestContext<{ content: string; author: unknown }>;
      const config = { enabledCollections: ['test'] };
      const validationError = new Error('Content is required');

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.updateCommentValidator).mockReturnValue({ left: validationError });

      await expect(getController(getStrapi()).put(ctx)).rejects.toThrow();
    });
  });

  describe('reportAbuse', () => {
    it('should report abuse when validation passes', async () => {
      const ctx = {
        params: { id: '1' },
        request: { body: { reason: 'spam' } },
        state: { user: { id: 1 } }
      } as RequestContext;
      const config = { enabledCollections: ['test'] };
      const validatedData = { id: '1', reason: 'spam' };
      const expectedResult = { success: true };

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.reportAbuseValidator).mockReturnValue({ right: validatedData });
      mockClientService.reportAbuse.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).reportAbuse(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockClientService.reportAbuse).toHaveBeenCalledWith(validatedData, { id: 1 });
    });

    it('should throw error when store config validation fails', async () => {
      const ctx = {
        params: { id: '1' },
        request: { body: { reason: 'spam' } },
        state: { user: { id: 1 } }
      } as RequestContext;
      const error = new Error('Config validation failed');

      mockStoreRepository.get.mockResolvedValue({ left: error });

      await expect(getController(getStrapi()).reportAbuse(ctx)).rejects.toThrow();
    });

    it('should throw error when reportAbuseValidator fails', async () => {
      const ctx = {
        params: { id: '1' },
        request: { body: { reason: 'spam' } },
        state: { user: { id: 1 } }
      } as RequestContext;
      const config = { enabledCollections: ['test'] };
      const error = new Error('Validation failed');

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.reportAbuseValidator).mockReturnValue({ left: error });

      await expect(getController(getStrapi()).reportAbuse(ctx)).rejects.toThrow();
    });
  });

  describe('removeComment', () => {
    it('should mark comment as removed when validation passes', async () => {
      const ctx = {
        params: { id: '1' },
        query: {},
        state: { user: { id: 1 } }
      } as RequestContext;
      const config = { enabledCollections: ['test'] };
      const validatedData = { id: '1' };
      const expectedResult = { success: true };

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.removeCommentValidator).mockReturnValue({ right: validatedData });
      mockClientService.markAsRemoved.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).removeComment(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockClientService.markAsRemoved).toHaveBeenCalledWith(validatedData, { id: 1 });
    });

    it('should throw error when store config validation fails', async () => {
      const ctx = {
        params: { id: '1' },
        query: {},
        state: { user: { id: 1 } }
      } as RequestContext;
      const error = new Error('Config validation failed');

      mockStoreRepository.get.mockResolvedValue({ left: error });

      await expect(getController(getStrapi()).removeComment(ctx)).rejects.toThrow();
    });

    it('should throw error when removeCommentValidator fails', async () => {
      const ctx = {
        params: { id: '1' },
        query: {},
        state: { user: { id: 1 } }
      } as RequestContext;
      const config = { enabledCollections: ['test'] };
      const error = new Error('Validation failed');

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.removeCommentValidator).mockReturnValue({ left: error });

      await expect(getController(getStrapi()).removeComment(ctx)).rejects.toThrow();
    });
  });

  describe('blockComment', () => {
    it('should block comment when validation passes', async () => {
      const ctx = {
        params: { relation: 'test', commentId: '1' },
      } as RequestContext;
      const config = { enabledCollections: ['test'] };
      const validatedData = { relation: 'test', commentId: '1' };
      const expectedResult = { id: 1, blocked: true };

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.changeBlockedCommentValidator).mockReturnValue({
        right: validatedData,
      });
      mockCommonService.changeBlockedComment.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).blockComment(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockCommonService.changeBlockedComment).toHaveBeenCalledWith('1', true);
    });

    it('should throw when store config fails', async () => {
      const ctx = { params: { relation: 'test', commentId: '1' } } as RequestContext;

      mockStoreRepository.get.mockResolvedValue({ left: new Error('fail') });

      await expect(getController(getStrapi()).blockComment(ctx)).rejects.toThrow();
    });

    it('should throw when validator fails', async () => {
      const ctx = { params: { relation: 'test', commentId: '1' } } as RequestContext;
      const config = { enabledCollections: ['test'] };

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.changeBlockedCommentValidator).mockReturnValue({
        left: new Error('Validation failed'),
      });

      await expect(getController(getStrapi()).blockComment(ctx)).rejects.toThrow();
    });
  });

  describe('unblockComment', () => {
    it('should unblock comment when validation passes', async () => {
      const ctx = {
        params: { relation: 'test', commentId: '2' },
      } as RequestContext;
      const config = { enabledCollections: ['test'] };
      const validatedData = { relation: 'test', commentId: '2' };
      const expectedResult = { id: 2, blocked: false };

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.changeBlockedCommentValidator).mockReturnValue({
        right: validatedData,
      });
      mockCommonService.changeBlockedComment.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).unblockComment(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockCommonService.changeBlockedComment).toHaveBeenCalledWith('2', false);
    });

    it('should throw when store config fails', async () => {
      const ctx = { params: { relation: 'test', commentId: '1' } } as RequestContext;

      mockStoreRepository.get.mockResolvedValue({ left: new Error('fail') });

      await expect(getController(getStrapi()).unblockComment(ctx)).rejects.toThrow();
    });

    it('should throw when validator fails', async () => {
      const ctx = { params: { relation: 'test', commentId: '1' } } as RequestContext;
      const config = { enabledCollections: ['test'] };

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.changeBlockedCommentValidator).mockReturnValue({
        left: new Error('Validation failed'),
      });

      await expect(getController(getStrapi()).unblockComment(ctx)).rejects.toThrow();
    });
  });

  describe('blockCommentThread', () => {
    it('should block thread when validation passes', async () => {
      const ctx = {
        params: { relation: 'test', commentId: '3' },
      } as RequestContext;
      const config = { enabledCollections: ['test'] };
      const validatedData = { relation: 'test', commentId: '3' };
      const expectedResult = { id: 3, blocked: true, blockedThread: true };

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.changeBlockedCommentValidator).mockReturnValue({
        right: validatedData,
      });
      mockCommonService.changeBlockedCommentThread.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).blockCommentThread(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockCommonService.changeBlockedCommentThread).toHaveBeenCalledWith('3', true);
    });

    it('should throw when store config fails', async () => {
      const ctx = { params: { relation: 'test', commentId: '1' } } as RequestContext;

      mockStoreRepository.get.mockResolvedValue({ left: new Error('fail') });

      await expect(getController(getStrapi()).blockCommentThread(ctx)).rejects.toThrow();
    });

    it('should throw when validator fails', async () => {
      const ctx = { params: { relation: 'test', commentId: '1' } } as RequestContext;
      const config = { enabledCollections: ['test'] };

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.changeBlockedCommentValidator).mockReturnValue({
        left: new Error('Validation failed'),
      });

      await expect(getController(getStrapi()).blockCommentThread(ctx)).rejects.toThrow();
    });
  });

  describe('unblockCommentThread', () => {
    it('should unblock thread when validation passes', async () => {
      const ctx = {
        params: { relation: 'test', commentId: '4' },
      } as RequestContext;
      const config = { enabledCollections: ['test'] };
      const validatedData = { relation: 'test', commentId: '4' };
      const expectedResult = { id: 4, blocked: false, blockedThread: false };

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.changeBlockedCommentValidator).mockReturnValue({
        right: validatedData,
      });
      mockCommonService.changeBlockedCommentThread.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).unblockCommentThread(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockCommonService.changeBlockedCommentThread).toHaveBeenCalledWith('4', false);
    });

    it('should throw when store config fails', async () => {
      const ctx = { params: { relation: 'test', commentId: '1' } } as RequestContext;

      mockStoreRepository.get.mockResolvedValue({ left: new Error('fail') });

      await expect(getController(getStrapi()).unblockCommentThread(ctx)).rejects.toThrow();
    });

    it('should throw when validator fails', async () => {
      const ctx = { params: { relation: 'test', commentId: '1' } } as RequestContext;
      const config = { enabledCollections: ['test'] };

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.changeBlockedCommentValidator).mockReturnValue({
        left: new Error('Validation failed'),
      });

      await expect(getController(getStrapi()).unblockCommentThread(ctx)).rejects.toThrow();
    });
  });

  describe('approveComment', () => {
    it('should approve comment when validation passes', async () => {
      const ctx = {
        params: { relation: 'test', commentId: '5' },
      } as RequestContext;
      const config = { enabledCollections: ['test'] };
      const validatedData = { relation: 'test', commentId: '5' };
      const expectedResult = { id: 5, approvalStatus: 'APPROVED' };

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.changeBlockedCommentValidator).mockReturnValue({
        right: validatedData,
      });
      mockCommonService.approveComment.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).approveComment(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockCommonService.approveComment).toHaveBeenCalledWith('5');
    });

    it('should throw when store config fails', async () => {
      const ctx = { params: { relation: 'test', commentId: '1' } } as RequestContext;

      mockStoreRepository.get.mockResolvedValue({ left: new Error('fail') });

      await expect(getController(getStrapi()).approveComment(ctx)).rejects.toThrow();
    });

    it('should throw when validator fails', async () => {
      const ctx = { params: { relation: 'test', commentId: '1' } } as RequestContext;
      const config = { enabledCollections: ['test'] };

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.changeBlockedCommentValidator).mockReturnValue({
        left: new Error('Validation failed'),
      });

      await expect(getController(getStrapi()).approveComment(ctx)).rejects.toThrow();
    });
  });

  describe('rejectComment', () => {
    it('should reject comment when validation passes', async () => {
      const ctx = {
        params: { relation: 'test', commentId: '6' },
      } as RequestContext;
      const config = { enabledCollections: ['test'] };
      const validatedData = { relation: 'test', commentId: '6' };
      const expectedResult = { id: 6, approvalStatus: 'REJECTED' };

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.changeBlockedCommentValidator).mockReturnValue({
        right: validatedData,
      });
      mockCommonService.rejectComment.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).rejectComment(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockCommonService.rejectComment).toHaveBeenCalledWith('6');
    });

    it('should throw when store config fails', async () => {
      const ctx = { params: { relation: 'test', commentId: '1' } } as RequestContext;

      mockStoreRepository.get.mockResolvedValue({ left: new Error('fail') });

      await expect(getController(getStrapi()).rejectComment(ctx)).rejects.toThrow();
    });

    it('should throw when validator fails', async () => {
      const ctx = { params: { relation: 'test', commentId: '1' } } as RequestContext;
      const config = { enabledCollections: ['test'] };

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.changeBlockedCommentValidator).mockReturnValue({
        left: new Error('Validation failed'),
      });

      await expect(getController(getStrapi()).rejectComment(ctx)).rejects.toThrow();
    });
  });

  describe('resolveAbuseReport', () => {
    it('should resolve single report when validation passes', async () => {
      const ctx = {
        params: { relation: 'test', commentId: '1', reportId: '9' },
      } as RequestContext;
      const config = { enabledCollections: ['test'] };
      const validated = { relation: 'test', commentId: 1, reportId: 9 };
      const expected = { count: 1 };

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.resolveAbuseReportValidator).mockReturnValue({ right: validated });
      mockAdminService.resolveAbuseReport.mockResolvedValue(expected);

      const result = await getController(getStrapi()).resolveAbuseReport(ctx);

      expect(result).toEqual(expected);
      expect(mockAdminService.resolveAbuseReport).toHaveBeenCalledWith({ id: 1, reportId: 9 });
    });

    it('should throw when store config fails', async () => {
      const ctx = {
        params: { relation: 'test', commentId: '1', reportId: '9' },
      } as RequestContext;

      mockStoreRepository.get.mockResolvedValue({ left: new Error('fail') });

      await expect(getController(getStrapi()).resolveAbuseReport(ctx)).rejects.toThrow();
    });

    it('should throw when validator fails', async () => {
      const ctx = {
        params: { relation: 'test', commentId: '1', reportId: '9' },
      } as RequestContext;
      const config = { enabledCollections: ['test'] };

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.resolveAbuseReportValidator).mockReturnValue({
        left: new Error('Validation failed'),
      });

      await expect(getController(getStrapi()).resolveAbuseReport(ctx)).rejects.toThrow();
    });
  });

  describe('resolveCommentMultipleAbuseReports', () => {
    it('should resolve selected reports when validation passes', async () => {
      const ctx = {
        params: { relation: 'test', commentId: '2' },
        request: { body: { reportIds: [10, 11] } },
      } as RequestContext<{ reportIds: number[] }>;
      const config = { enabledCollections: ['test'] };
      const validated = { relation: 'test', commentId: 2, reportIds: [10, 11] };
      const expected = { count: 2 };

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.resolveCommentMultipleAbuseReportsValidator).mockReturnValue({
        right: validated,
      });
      mockAdminService.resolveCommentMultipleAbuseReports.mockResolvedValue(expected);

      const result = await getController(getStrapi()).resolveCommentMultipleAbuseReports(ctx);

      expect(result).toEqual(expected);
      expect(mockAdminService.resolveCommentMultipleAbuseReports).toHaveBeenCalledWith({
        id: 2,
        reportIds: [10, 11],
      });
    });

    it('should throw when store config fails', async () => {
      const ctx = {
        params: { relation: 'test', commentId: '2' },
        request: { body: { reportIds: [10, 11] } },
      } as RequestContext<{ reportIds: number[] }>;

      mockStoreRepository.get.mockResolvedValue({ left: new Error('fail') });

      await expect(getController(getStrapi()).resolveCommentMultipleAbuseReports(ctx)).rejects.toThrow();
    });

    it('should throw when validator fails', async () => {
      const ctx = {
        params: { relation: 'test', commentId: '2' },
        request: { body: { reportIds: [10, 11] } },
      } as RequestContext<{ reportIds: number[] }>;
      const config = { enabledCollections: ['test'] };

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.resolveCommentMultipleAbuseReportsValidator).mockReturnValue({
        left: new Error('Validation failed'),
      });

      await expect(getController(getStrapi()).resolveCommentMultipleAbuseReports(ctx)).rejects.toThrow();
    });
  });

  describe('resolveAllAbuseReportsForComment', () => {
    it('should delegate to admin when validation passes', async () => {
      const ctx = { params: { relation: 'test', commentId: '3' } } as RequestContext;
      const config = { enabledCollections: ['test'] };
      const validated = { relation: 'test', commentId: 3 };
      const expected = { count: 3 };

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.changeBlockedCommentValidator).mockReturnValue({ right: validated });
      mockAdminService.resolveAllAbuseReportsForComment.mockResolvedValue(expected);

      const result = await getController(getStrapi()).resolveAllAbuseReportsForComment(ctx);

      expect(result).toEqual(expected);
      expect(mockAdminService.resolveAllAbuseReportsForComment).toHaveBeenCalledWith(3);
    });

    it('should throw when store config fails', async () => {
      const ctx = { params: { relation: 'test', commentId: '3' } } as RequestContext;

      mockStoreRepository.get.mockResolvedValue({ left: new Error('fail') });

      await expect(getController(getStrapi()).resolveAllAbuseReportsForComment(ctx)).rejects.toThrow();
    });

    it('should throw when validator fails', async () => {
      const ctx = { params: { relation: 'test', commentId: '3' } } as RequestContext;
      const config = { enabledCollections: ['test'] };

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.changeBlockedCommentValidator).mockReturnValue({
        left: new Error('Validation failed'),
      });

      await expect(getController(getStrapi()).resolveAllAbuseReportsForComment(ctx)).rejects.toThrow();
    });
  });

  describe('resolveAllAbuseReportsForThread', () => {
    it('should delegate to admin when validation passes', async () => {
      const ctx = { params: { relation: 'test', commentId: '4' } } as RequestContext;
      const config = { enabledCollections: ['test'] };
      const validated = { relation: 'test', commentId: 4 };
      const expected = { count: 1 };

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.changeBlockedCommentValidator).mockReturnValue({ right: validated });
      mockAdminService.resolveAllAbuseReportsForThread.mockResolvedValue(expected);

      const result = await getController(getStrapi()).resolveAllAbuseReportsForThread(ctx);

      expect(result).toEqual(expected);
      expect(mockAdminService.resolveAllAbuseReportsForThread).toHaveBeenCalledWith(4);
    });

    it('should throw when store config fails', async () => {
      const ctx = { params: { relation: 'test', commentId: '4' } } as RequestContext;

      mockStoreRepository.get.mockResolvedValue({ left: new Error('fail') });

      await expect(getController(getStrapi()).resolveAllAbuseReportsForThread(ctx)).rejects.toThrow();
    });

    it('should throw when validator fails', async () => {
      const ctx = { params: { relation: 'test', commentId: '4' } } as RequestContext;
      const config = { enabledCollections: ['test'] };

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.changeBlockedCommentValidator).mockReturnValue({
        left: new Error('Validation failed'),
      });

      await expect(getController(getStrapi()).resolveAllAbuseReportsForThread(ctx)).rejects.toThrow();
    });
  });

  describe('resolveMultipleAbuseReports', () => {
    it('should delegate to admin with reportIds only', async () => {
      const ctx = {
        params: { relation: 'test' },
        request: { body: { reportIds: [20, 21] } },
      } as RequestContext<{ reportIds: number[] }>;
      const config = { enabledCollections: ['test'] };
      const validated = { relation: 'test', reportIds: [20, 21] };
      const expected = { count: 2 };

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.resolveMultipleAbuseReportsValidator).mockReturnValue({
        right: validated,
      });
      mockAdminService.resolveMultipleAbuseReports.mockResolvedValue(expected);

      const result = await getController(getStrapi()).resolveMultipleAbuseReports(ctx);

      expect(result).toEqual(expected);
      expect(mockAdminService.resolveMultipleAbuseReports).toHaveBeenCalledWith({ reportIds: [20, 21] });
    });

    it('should throw when store config fails', async () => {
      const ctx = {
        params: { relation: 'test' },
        request: { body: { reportIds: [20, 21] } },
      } as RequestContext<{ reportIds: number[] }>;

      mockStoreRepository.get.mockResolvedValue({ left: new Error('fail') });

      await expect(getController(getStrapi()).resolveMultipleAbuseReports(ctx)).rejects.toThrow();
    });

    it('should throw when validator fails', async () => {
      const ctx = {
        params: { relation: 'test' },
        request: { body: { reportIds: [20, 21] } },
      } as RequestContext<{ reportIds: number[] }>;
      const config = { enabledCollections: ['test'] };

      mockStoreRepository.get.mockResolvedValue({ right: config });
      caster<jest.Mock>(clientValidator.resolveMultipleAbuseReportsValidator).mockReturnValue({
        left: new Error('Validation failed'),
      });

      await expect(getController(getStrapi()).resolveMultipleAbuseReports(ctx)).rejects.toThrow();
    });
  });
});
