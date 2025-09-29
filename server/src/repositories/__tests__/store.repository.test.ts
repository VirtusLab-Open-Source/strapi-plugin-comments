import { CoreStrapi } from '../../@types';
import { caster } from '../../test/utils';
import { PLUGIN_SELECTOR, REGEX, REPORT_REASON } from '../../const';
import { getStoreRepositorySource } from '../store.repository';

describe('Store repository', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const mockStore = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  };

  const getStrapi = () => caster<CoreStrapi>({
    config: {
      get: jest.fn(),
    },
    store: jest.fn().mockResolvedValue(mockStore),
    plugin: jest.fn(),
  });

  const getRepository = (strapi: CoreStrapi) => getStoreRepositorySource(strapi);

  describe('getLocalConfig', () => {
    it('returns config value for given property', () => {
      const strapi = getStrapi();
      const defaultValue = {
        test: ['test'],
      };
      caster<jest.Mock>(strapi.config.get).mockReturnValue('test-value');

      const result = getRepository(strapi).getLocalConfig('entryLabel', defaultValue);

      expect(strapi.config.get).toHaveBeenCalledWith(`${PLUGIN_SELECTOR}.entryLabel`, defaultValue);
      expect(result).toBe('test-value');
    });
  });

  describe('getStore', () => {
    it('returns store instance', async () => {
      const strapi = getStrapi();

      const result = await getRepository(strapi).getStore();

      expect(strapi.store).toHaveBeenCalledWith({ type: 'plugin', name: 'comments' });
      expect(result).toBe(mockStore);
    });
  });

  describe('getConfig', () => {
    it('returns config from store', async () => {
      const strapi = getStrapi();
      const mockConfig = { entryLabel: 'test' };
      mockStore.get.mockResolvedValue(mockConfig);

      const result = await getRepository(strapi).getConfig();

      expect(mockStore.get).toHaveBeenCalledWith({ key: 'config' });
      expect(result).toEqual(mockConfig);
    });
  });

  describe('get', () => {
    it('returns stored config when available', async () => {
      const strapi = getStrapi();
      const mockConfig = { entryLabel: 'test', approvalFlow: true };
      mockStore.get.mockResolvedValue(mockConfig);

      const result = await getRepository(strapi).get();

      expect(result.right).toEqual({
        ...mockConfig,
        regex: expect.any(Object),
      });
    });

    it('returns local config when store is empty', async () => {
      const strapi = getStrapi();
      mockStore.get.mockResolvedValue(null);
      caster<jest.Mock>(strapi.config.get).mockImplementation((path) => {
        if (path === `${PLUGIN_SELECTOR}.entryLabel`) return 'local-label';
        if (path === `${PLUGIN_SELECTOR}.approvalFlow`) return true;
        return undefined;
      });

      const result = await getRepository(strapi).get();

      expect(result.right).toEqual({
        entryLabel: 'local-label',
        approvalFlow: true,
        blockedAuthorProps: undefined,
        reportReasons: undefined,
        regex: expect.any(Object),
      });
    });

    it('includes additional fields when viaSettingsPage is true', async () => {
      const strapi = getStrapi();
      mockStore.get.mockResolvedValue(null);
      caster<jest.Mock>(strapi.plugin).mockReturnValue(true); // Mock graphql plugin enabled

      const result = await getRepository(strapi).get(true);

      expect(result.right).toHaveProperty('isGQLPluginEnabled', true);
      expect(result.right).toHaveProperty('enabledCollections');
      expect(result.right).toHaveProperty('moderatorRoles');
    });

    describe('reportReasons functionality', () => {
      it('always reads reportReasons from local config, even when store config exists', async () => {
        const strapi = getStrapi();
        const mockConfig = { entryLabel: 'test', approvalFlow: true };
        mockStore.get.mockResolvedValue(mockConfig);

        const localReportReasons = {
          BAD_LANGUAGE: 'Inappropriate Language',
          DISCRIMINATION: 'Discriminatory Content',
          OTHER: 'Other Reason',
        };

        caster<jest.Mock>(strapi.config.get).mockImplementation((path) => {
          if (path === `${PLUGIN_SELECTOR}.reportReasons`)
            return localReportReasons;
          return undefined;
        });

        const result = await getRepository(strapi).get();

        expect(result.right).toEqual({
          ...mockConfig,
          reportReasons: localReportReasons, // Always from local config, not from stored config
          regex: expect.any(Object),
        });
      });

      it('reads reportReasons from local config when store config does not exist', async () => {
        const strapi = getStrapi();
        mockStore.get.mockResolvedValue(null);

        const localReportReasons = {
          BAD_LANGUAGE: 'Inappropriate Language',
          DISCRIMINATION: 'Discriminatory Content',
          OTHER: 'Other Reason',
        };

        caster<jest.Mock>(strapi.config.get).mockImplementation((path) => {
          if (path === `${PLUGIN_SELECTOR}.entryLabel`) return 'local-label';
          if (path === `${PLUGIN_SELECTOR}.approvalFlow`) return true;
          if (path === `${PLUGIN_SELECTOR}.reportReasons`)
            return localReportReasons;
          return undefined;
        });

        const result = await getRepository(strapi).get();

        expect(result.right).toEqual({
          entryLabel: 'local-label',
          approvalFlow: true,
          blockedAuthorProps: undefined,
          reportReasons: localReportReasons,
          regex: expect.any(Object),
        });
      });

      it('handles undefined reportReasons from local config', async () => {
        const strapi = getStrapi();
        const mockConfig = { entryLabel: 'test', approvalFlow: true };
        mockStore.get.mockResolvedValue(mockConfig);

        caster<jest.Mock>(strapi.config.get).mockImplementation((path) => {
          if (path === `${PLUGIN_SELECTOR}.reportReasons`) return undefined;
          return undefined;
        });

        const result = await getRepository(strapi).get();

        expect(result.right).toEqual({
          ...mockConfig,
          reportReasons: undefined,
          regex: expect.any(Object),
        });
      });

      it('includes reportReasons when viaSettingsPage is true', async () => {
        const strapi = getStrapi();
        mockStore.get.mockResolvedValue(null);
        caster<jest.Mock>(strapi.plugin).mockReturnValue(true);

        const localReportReasons = {
          BAD_LANGUAGE: 'Inappropriate Language',
          DISCRIMINATION: 'Discriminatory Content',
          OTHER: 'Other Reason',
        };

        caster<jest.Mock>(strapi.config.get).mockImplementation((path) => {
          if (path === `${PLUGIN_SELECTOR}.entryLabel`) return 'local-label';
          if (path === `${PLUGIN_SELECTOR}.approvalFlow`) return true;
          if (path === `${PLUGIN_SELECTOR}.reportReasons`)
            return localReportReasons;
          if (path === `${PLUGIN_SELECTOR}.enabledCollections`)
            return ['api::article.article'];
          if (path === `${PLUGIN_SELECTOR}.moderatorRoles`)
            return ['authenticated'];
          return undefined;
        });

        const result = await getRepository(strapi).get(true);

        expect(result.right).toEqual({
          entryLabel: 'local-label',
          approvalFlow: true,
          blockedAuthorProps: undefined,
          reportReasons: localReportReasons,
          enabledCollections: ['api::article.article'],
          moderatorRoles: ['authenticated'],
          isGQLPluginEnabled: true,
          regex: expect.any(Object),
        });
      });
    });
  });

  describe('update', () => {
    it('updates config in store', async () => {
      const strapi = getStrapi();
      const newConfig = { entryLabel: { test: ['test'] } };

      await getRepository(strapi).update(newConfig);

      expect(mockStore.set).toHaveBeenCalledWith({
        key: 'config',
        value: {
          ...newConfig,
          reportReasons: {
            BAD_LANGUAGE: REPORT_REASON.BAD_LANGUAGE,
            DISCRIMINATION: REPORT_REASON.DISCRIMINATION,
            OTHER: REPORT_REASON.OTHER,
          },
        },
      });
    });

    it('always sets default reportReasons when updating config', async () => {
      const strapi = getStrapi();
      const newConfig = {
        entryLabel: { test: ['test'] },
        reportReasons: {
          BAD_LANGUAGE: REPORT_REASON.BAD_LANGUAGE,
          DISCRIMINATION: REPORT_REASON.DISCRIMINATION,
          OTHER: REPORT_REASON.OTHER,
        },
      } as any;

      await getRepository(strapi).update(newConfig);

      expect(mockStore.set).toHaveBeenCalledWith({
        key: 'config',
        value: {
          ...newConfig,
          reportReasons: {
            BAD_LANGUAGE: REPORT_REASON.BAD_LANGUAGE,
            DISCRIMINATION: REPORT_REASON.DISCRIMINATION,
            OTHER: REPORT_REASON.OTHER,
          },
        },
      });
    });
  });

  describe('restore', () => {
    it('deletes config from store', async () => {
      const strapi = getStrapi();

      await getRepository(strapi).restore();

      expect(mockStore.delete).toHaveBeenCalledWith({ key: 'config' });
    });
  });
});
