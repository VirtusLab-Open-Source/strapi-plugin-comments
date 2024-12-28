import { StrapiContext } from '../../@types';
import { CommentsPluginConfig } from '../../config';
import { REPORT_REASON } from '../../const';
import { getStoreRepository } from '../../repositories';
import { caster } from '../../test/utils';
import { makeLeft, makeRight } from '../../utils/Either';
import settingsService from '../settings.service';

jest.mock('../../repositories', () => ({
  getStoreRepository: jest.fn(),
}));

describe('settings.service', () => {
  const mockStoreRepository = {
    get: jest.fn(),
    update: jest.fn(),
    restore: jest.fn(),
  };

  const mockReload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    caster<jest.Mock>(getStoreRepository).mockReturnValue(mockStoreRepository);
  });

  const getStrapi = () => caster<StrapiContext>({ 
    strapi: { 
      reload: mockReload,
    } 
  });

  const getService = (strapi: StrapiContext) => settingsService(strapi);

  describe('getConfig', () => {
    it('should return config when repository returns right value', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockConfig: Partial<CommentsPluginConfig> = { 
        isValidationEnabled: true,
        moderatorRoles: ['admin'],
        enabledCollections: [],
        approvalFlow: [],
        entryLabel: { '*': ['title'] },
        reportReasons: {
          BAD_LANGUAGE: REPORT_REASON.BAD_LANGUAGE,
          DISCRIMINATION: REPORT_REASON.DISCRIMINATION,
          OTHER: REPORT_REASON.OTHER,
        },
        blockedAuthorProps: [],
      };

      mockStoreRepository.get.mockResolvedValue(makeRight(mockConfig));

      const result = await service.getConfig();

      expect(result).toEqual(mockConfig);
      expect(mockStoreRepository.get).toHaveBeenCalledWith(false);
    });

    it('should throw error when repository returns left value', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockError = new Error('Failed to get config');

      mockStoreRepository.get.mockResolvedValue(makeLeft(mockError));

      await expect(service.getConfig()).rejects.toThrow(mockError);
    });

    it('should pass viaSettingsPage parameter to repository', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockConfig: Partial<CommentsPluginConfig> = {
        isValidationEnabled: true,
        moderatorRoles: ['admin'],
        enabledCollections: [],
        approvalFlow: [],
        entryLabel: { '*': ['title'] },
        reportReasons: {
          BAD_LANGUAGE: REPORT_REASON.BAD_LANGUAGE,
          DISCRIMINATION: REPORT_REASON.DISCRIMINATION,
          OTHER: REPORT_REASON.OTHER,
        },
        blockedAuthorProps: [],
      };

      mockStoreRepository.get.mockResolvedValue(makeRight(mockConfig));

      await service.getConfig(true);

      expect(mockStoreRepository.get).toHaveBeenCalledWith(true);
    });
  });

  describe('update', () => {
    const mockConfig: CommentsPluginConfig = {
      isValidationEnabled: true,
      moderatorRoles: ['admin'],
      enabledCollections: [],
      approvalFlow: ['api::test.test'],
      entryLabel: { '*': ['title'] },
      reportReasons: {
        BAD_LANGUAGE: REPORT_REASON.BAD_LANGUAGE,
        DISCRIMINATION: REPORT_REASON.DISCRIMINATION,
        OTHER: REPORT_REASON.OTHER,
      },
      blockedAuthorProps: [],
    };

    it('should update config when repository returns right value', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      mockStoreRepository.update.mockResolvedValue(makeRight(mockConfig));

      const result = await service.update(mockConfig);

      expect(result).toEqual(mockConfig);
      expect(mockStoreRepository.update).toHaveBeenCalledWith(mockConfig);
    });

    it('should throw error when repository returns left value', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockError = new Error('Failed to update config');

      mockStoreRepository.update.mockResolvedValue(makeLeft(mockError));

      await expect(service.update(mockConfig)).rejects.toThrow(mockError);
    });
  });

  describe('restore', () => {
    it('should restore config when repository returns right value', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockConfig: Partial<CommentsPluginConfig> = {
        isValidationEnabled: true,
        moderatorRoles: ['admin'],
        enabledCollections: [],
        approvalFlow: [],
        entryLabel: { '*': ['title'] },
        reportReasons: {
          BAD_LANGUAGE: REPORT_REASON.BAD_LANGUAGE,
          DISCRIMINATION: REPORT_REASON.DISCRIMINATION,
          OTHER: REPORT_REASON.OTHER,
        },
        blockedAuthorProps: [],
      };

      mockStoreRepository.restore.mockResolvedValue(makeRight(mockConfig));

      const result = await service.restore();

      expect(result).toEqual(mockConfig);
      expect(mockStoreRepository.restore).toHaveBeenCalled();
    });

    it('should throw error when repository returns left value', async () => {
      const strapi = getStrapi();
      const service = getService(strapi);
      const mockError = new Error('Failed to restore config');

      mockStoreRepository.restore.mockResolvedValue(makeLeft(mockError));

      await expect(service.restore()).rejects.toThrow(mockError);
    });
  });

  describe('restart', () => {
    it('should call strapi reload', () => {
      const strapi = getStrapi();
      const service = getService(strapi);

      service.restart();

      expect(mockReload).toHaveBeenCalled();
    });
  });
});
