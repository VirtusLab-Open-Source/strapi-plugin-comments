import { RequestContext, StrapiContext } from '../../@types';
import { caster } from '../../test/utils';
import { getPluginService } from '../../utils/getPluginService';
import { validateConfig } from '../../validators/api/controllers/settings.controller.validator';
import controllers from '../settings.controller';

jest.mock('../../utils/getPluginService', () => ({
  getPluginService: jest.fn(),
}));

jest.mock('../../validators/api/controllers/settings.controller.validator', () => ({
  validateConfig: jest.fn(),
}));

describe('Settings controller', () => {
  const mockSettingsService = {
    getConfig: jest.fn(),
    update: jest.fn(),
    restore: jest.fn(),
    restart: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    caster<jest.Mock>(getPluginService).mockReturnValue(mockSettingsService);
  });

  const getStrapi = () => caster<StrapiContext>({ strapi: {} });
  const getController = (strapi: StrapiContext) => controllers(strapi);

  describe('get', () => {
    it('should return config when successful', async () => {
      const ctx = {} as RequestContext;
      const expectedResult = { enabledCollections: ['test'] };

      mockSettingsService.getConfig.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).get(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockSettingsService.getConfig).toHaveBeenCalled();
    });

    it('should throw error when service fails', async () => {
      const ctx = {} as RequestContext;
      const error = new Error('Service error');

      mockSettingsService.getConfig.mockRejectedValue(error);

      await expect(getController(getStrapi()).get(ctx)).rejects.toThrow();
    });
  });

  describe('getForSettingsPage', () => {
    it('should return config with isSettingsPage flag when successful', async () => {
      const ctx = {} as RequestContext;
      const expectedResult = { enabledCollections: ['test'], isSettingsPage: true };

      mockSettingsService.getConfig.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).getForSettingsPage(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockSettingsService.getConfig).toHaveBeenCalledWith(true);
    });

    it('should throw error when service fails', async () => {
      const ctx = {} as RequestContext;
      const error = new Error('Service error');

      mockSettingsService.getConfig.mockRejectedValue(error);

      await expect(getController(getStrapi()).getForSettingsPage(ctx)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update config when validation passes', async () => {
      const config = { enabledCollections: ['test'] };
      const ctx = {
        request: { body: config }
      } as RequestContext;
      const expectedResult = { success: true };

      caster<jest.Mock>(validateConfig).mockReturnValue({ right: config });
      mockSettingsService.update.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).update(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockSettingsService.update).toHaveBeenCalledWith(config);
    });

    it('should throw error when validation fails', async () => {
      const config = { enabledCollections: ['invalid'] };
      const ctx = {
        request: { body: config }
      } as RequestContext;
      const error = new Error('Validation failed');

      caster<jest.Mock>(validateConfig).mockReturnValue({ left: error });

      await expect(getController(getStrapi()).update(ctx)).rejects.toThrow();
    });
  });

  describe('restore', () => {
    it('should restore config when successful', async () => {
      const ctx = {} as RequestContext;
      const expectedResult = { success: true };

      mockSettingsService.restore.mockResolvedValue(expectedResult);

      const result = await getController(getStrapi()).restore(ctx);

      expect(result).toEqual(expectedResult);
      expect(mockSettingsService.restore).toHaveBeenCalled();
    });

    it('should throw error when service fails', async () => {
      const ctx = {} as RequestContext;
      const error = new Error('Service error');

      mockSettingsService.restore.mockRejectedValue(error);

      await expect(getController(getStrapi()).restore(ctx)).rejects.toThrow();
    });
  });

  describe('restart', () => {
    it('should restart and return success message', async () => {
      const ctx = {
        send: jest.fn()
      } as unknown as RequestContext;
      const expectedResult = { message: 'Restarted', status: 200 };

      const result = await getController(getStrapi()).restart(ctx);

      expect(ctx.send).toHaveBeenCalledWith(expectedResult);
      expect(mockSettingsService.restart).toHaveBeenCalled();
    });

    it('should throw error when service fails', async () => {
      const ctx = {
        send: jest.fn()
      } as unknown as RequestContext;
      const error = new Error('Service error');

      mockSettingsService.restart.mockImplementation(() => {
        throw error;
      });

      await expect(getController(getStrapi()).restart(ctx)).rejects.toThrow();
    });
  });
});
