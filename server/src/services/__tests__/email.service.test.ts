import { StrapiContext } from '../../@types';
import { caster } from '../../test/utils';
import { emailService } from '../email.service';

describe('email.service', () => {
  const mockEmailPluginSend = jest.fn();

  const mockLog = {
    warn: jest.fn(),
    error: jest.fn(),
  };

  const emailOptions = {
    to: ['author@example.com'],
    from: 'noreply@example.com',
    subject: 'Test subject',
    text: 'Test body',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const createStrapi = (config?: { noPlugin?: boolean; noEmailService?: boolean }) => {
    const pluginMock = jest.fn();
    if (config?.noPlugin) {
      pluginMock.mockReturnValue(undefined);
    } else if (config?.noEmailService) {
      pluginMock.mockReturnValue({
        service: jest.fn().mockReturnValue(undefined),
      });
    } else {
      pluginMock.mockReturnValue({
        service: jest.fn().mockReturnValue({ send: mockEmailPluginSend }),
      });
    }

    return caster<StrapiContext>({
      strapi: {
        plugin: pluginMock,
        log: mockLog,
      },
    });
  };

  const getService = (strapi: StrapiContext) => emailService(strapi);

  describe('send', () => {
    it('should warn and return when the email plugin is not available', async () => {
      const strapi = createStrapi({ noPlugin: true });
      const service = getService(strapi);

      const result = await service.send(emailOptions);

      expect(result).toBeUndefined();
      expect(strapi.strapi.plugin).toHaveBeenCalledWith('email');
      expect(mockLog.warn).toHaveBeenCalledWith('Email service not found');
      expect(mockEmailPluginSend).not.toHaveBeenCalled();
    });

    it('should warn and return when the email plugin service is not available', async () => {
      const strapi = createStrapi({ noEmailService: true });
      const service = getService(strapi);

      const result = await service.send(emailOptions);

      expect(result).toBeUndefined();
      expect(strapi.strapi.plugin).toHaveBeenCalledWith('email');
      expect(mockLog.warn).toHaveBeenCalledWith('Email service not found');
      expect(mockEmailPluginSend).not.toHaveBeenCalled();
    });

    it('should call the Strapi email plugin send with the given options', async () => {
      mockEmailPluginSend.mockResolvedValue({ messageId: 'msg-1' });
      const strapi = createStrapi();
      const service = getService(strapi);

      const result = await service.send(emailOptions);

      expect(mockEmailPluginSend).toHaveBeenCalledWith(emailOptions);
      expect(result).toEqual({ messageId: 'msg-1' });
      expect(mockLog.warn).not.toHaveBeenCalled();
      expect(mockLog.error).not.toHaveBeenCalled();
    });

    it('should log the error and rethrow when send rejects', async () => {
      const err = new Error('SMTP failure');
      mockEmailPluginSend.mockRejectedValue(err);
      const strapi = createStrapi();
      const service = getService(strapi);

      await expect(service.send(emailOptions)).rejects.toThrow('SMTP failure');

      expect(mockLog.error).toHaveBeenCalledWith(err);
    });

    it('should reject with timeout and log when send does not resolve in time', async () => {
      jest.useFakeTimers();
      mockEmailPluginSend.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ late: true }), 11_000);
          }),
      );
      const strapi = createStrapi();
      const service = getService(strapi);

      const sendPromise = service.send(emailOptions);
      const expectation = expect(sendPromise).rejects.toThrow('Email service timeout');

      await jest.advanceTimersByTimeAsync(10_000);
      await expectation;

      expect(mockLog.error).toHaveBeenCalledWith(expect.any(Error));
      const loggedError = caster<Error>(mockLog.error.mock.calls[0][0]);
      expect(loggedError.message).toBe('Email service timeout');

      await jest.advanceTimersByTimeAsync(1_000);
    });
  });
});
