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
  });

  describe('restore', () => {
    it('deletes config from store', async () => {
      const strapi = getStrapi();

      await getRepository(strapi).restore();

      expect(mockStore.delete).toHaveBeenCalledWith({ key: 'config' });
    });
  });
});
