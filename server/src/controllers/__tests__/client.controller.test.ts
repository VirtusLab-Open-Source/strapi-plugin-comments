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
          threadOf: {
            populate: {
              authorUser: true
            }
          }
        }
      });
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
          threadOf: {
            populate: {
              authorUser: true
            }
          }
        }
      });
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
          threadOf: {
            populate: {
              authorUser: true
            }
          }
        }
      }, true);
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
          threadOf: {
            populate: {
              authorUser: true
            }
          }
        }
      }, false);
    });
  });

  describe('put', () => {
    it('should update comment when validation passes', async () => {
      const ctx = {
        params: { id: '1' },
        query: {},
        state: { user: { id: 1 } },
        request: { body: { content: 'Updated content' } }
      } as RequestContext;
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
  });
});
