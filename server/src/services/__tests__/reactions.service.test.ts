import { StrapiContext } from '../../@types';
import { caster } from '../../test/utils';
import reactionsService from '../reactions.service';

jest.mock('../../utils/getPluginService', () => ({
  getPluginService: jest.fn((_strapi, name: string) => {
    if (name === 'common') {
      return {
        getConfig: jest.fn().mockResolvedValue(true),
      };
    }
    return {};
  }),
}));

describe('reactions.service', () => {
  const mockFindMany = jest.fn();
  const mockDelete = jest.fn();
  const mockGetConfig = jest.fn().mockResolvedValue(true);

  const getStrapi = (withReactionsPlugin = true) =>
    caster<StrapiContext>({
      strapi: {
        plugin: jest.fn((name: string) =>
          withReactionsPlugin && name === 'reactions' ? {} : undefined,
        ),
        documents: jest.fn(() => ({
          findMany: mockFindMany,
          delete: mockDelete,
        })),
      },
    });

  const mockReactionsDisabled = () => {
    const { getPluginService } = jest.requireMock('../../utils/getPluginService');
    getPluginService.mockImplementationOnce((_strapi: unknown, name: string) => {
      if (name === 'common') {
        return {
          getConfig: mockGetConfig.mockResolvedValueOnce(false),
        };
      }
      return {};
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockDelete.mockResolvedValue(true);
    mockGetConfig.mockResolvedValue(true);

    const { getPluginService } = jest.requireMock('../../utils/getPluginService');
    getPluginService.mockImplementation((_strapi: unknown, name: string) => {
      if (name === 'common') {
        return {
          getConfig: mockGetConfig,
        };
      }
      return {};
    });
  });

  describe('isPluginInstalled', () => {
    it('should return true when reactions plugin is registered', () => {
      const service = reactionsService(getStrapi());

      expect(service.isPluginInstalled()).toBe(true);
    });

    it('should return false when reactions plugin is not registered', () => {
      const service = reactionsService(getStrapi(false));

      expect(service.isPluginInstalled()).toBe(false);
    });
  });

  describe('isEnabled', () => {
    it('should return false when reactions plugin is not installed', async () => {
      const service = reactionsService(getStrapi(false));

      expect(await service.isEnabled()).toBe(false);
      expect(mockGetConfig).not.toHaveBeenCalled();
    });

    it('should return false when reactions integration is disabled in config', async () => {
      mockGetConfig.mockResolvedValueOnce(false);
      const service = reactionsService(getStrapi());

      expect(await service.isEnabled()).toBe(false);
      expect(mockGetConfig).toHaveBeenCalledWith('reactionsEnabled', false);
    });

    it('should return true when reactions plugin is installed and enabled in config', async () => {
      const service = reactionsService(getStrapi());

      expect(await service.isEnabled()).toBe(true);
      expect(mockGetConfig).toHaveBeenCalledWith('reactionsEnabled', false);
    });
  });

  describe('getCountsForComments', () => {
    it('should return empty object when reactions plugin is not installed', async () => {
      const service = reactionsService(getStrapi(false));
      const result = await service.getCountsForComments(['doc-1']);

      expect(result).toEqual({});
      expect(mockFindMany).not.toHaveBeenCalled();
    });

    it('should return empty object when reactions integration is disabled', async () => {
      mockReactionsDisabled();

      const service = reactionsService(getStrapi());
      const result = await service.getCountsForComments(['doc-1']);

      expect(result).toEqual({});
      expect(mockFindMany).not.toHaveBeenCalled();
    });

    it('should return empty object when no valid documentIds are provided', async () => {
      const service = reactionsService(getStrapi());
      const result = await service.getCountsForComments([null, undefined, '']);

      expect(result).toEqual({});
      expect(mockFindMany).not.toHaveBeenCalled();
    });

    it('should return empty object when findMany returns null', async () => {
      mockFindMany.mockResolvedValue(null);

      const service = reactionsService(getStrapi());
      const result = await service.getCountsForComments(['doc-1']);

      expect(result).toEqual({});
    });

    it('should skip reactions with invalid relatedUid or missing kind slug', async () => {
      mockFindMany.mockResolvedValue([
        {
          relatedUid: 'api::article.article:doc-1',
          kind: { slug: 'like' },
        },
        {
          relatedUid: 'plugin::comments.comment:doc-2',
          kind: null,
        },
        {
          relatedUid: 'plugin::comments.comment:doc-3',
          kind: { slug: 'love' },
        },
      ]);

      const service = reactionsService(getStrapi());
      const result = await service.getCountsForComments(['doc-1', 'doc-2', 'doc-3']);

      expect(result).toEqual({
        'doc-3': { love: 1 },
      });
    });

    it('should aggregate reaction counts per comment documentId', async () => {
      mockFindMany.mockResolvedValue([
        {
          relatedUid: 'plugin::comments.comment:doc-1',
          kind: { slug: 'like' },
        },
        {
          relatedUid: 'plugin::comments.comment:doc-1',
          kind: { slug: 'like' },
        },
        {
          relatedUid: 'plugin::comments.comment:doc-1',
          kind: { slug: 'love' },
        },
        {
          relatedUid: 'plugin::comments.comment:doc-2',
          kind: { slug: 'love' },
        },
      ]);

      const service = reactionsService(getStrapi());
      const result = await service.getCountsForComments(['doc-1', 'doc-2'], 'en');

      expect(result).toEqual({
        'doc-1': { like: 2, love: 1 },
        'doc-2': { love: 1 },
      });
      expect(mockFindMany).toHaveBeenCalledWith({
        filters: {
          relatedUid: {
            $in: [
              'plugin::comments.comment:doc-1',
              'plugin::comments.comment:doc-2',
            ],
          },
        },
        populate: {
          kind: {
            fields: ['slug'],
          },
        },
        locale: 'en',
      });
    });

    it('should return empty reactions map for each comment when no reactions are found', async () => {
      mockFindMany.mockResolvedValue([]);

      const service = reactionsService(getStrapi());
      const result = await service.getCountsForComments(['doc-1', 'doc-2']);

      expect(result).toEqual({});
    });
  });

  describe('removeForComments', () => {
    it('should not delete reactions when plugin is not installed', async () => {
      const service = reactionsService(getStrapi(false));
      await service.removeForComments(['doc-1']);

      expect(mockFindMany).not.toHaveBeenCalled();
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it('should not query reactions when no valid documentIds are provided', async () => {
      const service = reactionsService(getStrapi());
      await service.removeForComments([null, undefined, '']);

      expect(mockFindMany).not.toHaveBeenCalled();
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it('should not delete reactions when findMany returns null', async () => {
      mockFindMany.mockResolvedValue(null);

      const service = reactionsService(getStrapi());
      await service.removeForComments(['doc-1']);

      expect(mockDelete).not.toHaveBeenCalled();
    });

    it('should delete all reactions linked to provided comments', async () => {
      mockFindMany.mockResolvedValue([
        { documentId: 'reaction-1' },
        { documentId: 'reaction-2' },
      ]);

      const service = reactionsService(getStrapi());
      await service.removeForComments(['doc-1'], 'en');

      expect(mockFindMany).toHaveBeenCalledWith({
        filters: {
          relatedUid: {
            $in: ['plugin::comments.comment:doc-1'],
          },
        },
        locale: 'en',
      });
      expect(mockDelete).toHaveBeenCalledTimes(2);
      expect(mockDelete).toHaveBeenCalledWith({
        documentId: 'reaction-1',
        locale: 'en',
      });
      expect(mockDelete).toHaveBeenCalledWith({
        documentId: 'reaction-2',
        locale: 'en',
      });
    });
  });
});
