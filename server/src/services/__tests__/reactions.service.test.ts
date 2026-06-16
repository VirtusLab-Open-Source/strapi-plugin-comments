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

  beforeEach(() => {
    jest.clearAllMocks();
    mockDelete.mockResolvedValue(true);
  });

  describe('getCountsForComments', () => {
    it('should return empty object when reactions plugin is not installed', async () => {
      const service = reactionsService(getStrapi(false));
      const result = await service.getCountsForComments(['doc-1']);

      expect(result).toEqual({});
      expect(mockFindMany).not.toHaveBeenCalled();
    });

    it('should return empty object when reactions integration is disabled', async () => {
      const { getPluginService } = jest.requireMock('../../utils/getPluginService');
      getPluginService.mockImplementationOnce((_strapi: unknown, name: string) => {
        if (name === 'common') {
          return {
            getConfig: jest.fn().mockResolvedValue(false),
          };
        }
        return {};
      });

      const service = reactionsService(getStrapi());
      const result = await service.getCountsForComments(['doc-1']);

      expect(result).toEqual({});
      expect(mockFindMany).not.toHaveBeenCalled();
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
          relatedUid: 'plugin::comments.comment:doc-2',
          kind: { slug: 'love' },
        },
      ]);

      const service = reactionsService(getStrapi());
      const result = await service.getCountsForComments(['doc-1', 'doc-2'], 'en');

      expect(result).toEqual({
        'doc-1': { like: 2 },
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
  });

  describe('removeForComments', () => {
    it('should delete all reactions linked to provided comments', async () => {
      mockFindMany.mockResolvedValue([
        { documentId: 'reaction-1' },
        { documentId: 'reaction-2' },
      ]);

      const service = reactionsService(getStrapi());
      await service.removeForComments(['doc-1'], 'en');

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
