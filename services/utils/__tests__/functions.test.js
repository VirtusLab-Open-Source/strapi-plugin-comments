const PluginError = require('../error');
const { checkBadWords, extractMeta, isValidUserContext, resolveUserContextError } = require('../functions');

beforeEach(() => {
  Object.defineProperty(global, 'strapi', {
    value: {
      plugins: {
        comments: {
          package: require('../../../package.json'),
          services: {
            comments: require('../../comments'),
          },
          models: {
            comment: require('../../../models/comment.settings.json'),
            report: require('../../../models/report.settings.json'),
          }
        }
      },
      config: {
        custom: {
          plugins: {
            comments: {
              enableUsers: false,
            }
          }
        }
      }
    },
    writable: true,
  });
})

describe('Test Comments service functions utils', () => {
  
  describe('Bad Words filtering', () => {
    const text = 'Lorem ipsum dolor sit fuck amet';

    test('Should find bad words usage and throw error PluginError', () => {
      expect.assertions(6);
      try {
        checkBadWords(text);
      } catch (e) {
        expect(e).toBeInstanceOf(PluginError);
        expect(e).toHaveProperty('status', 400);
        expect(e).toHaveProperty('name', 'Strapi:Plugin:Comments');
        expect(e).toHaveProperty('message', 'Bad language used! Please polite your comment...');
        expect(e).toHaveProperty('payload');
        expect(e.payload).toEqual(expect.objectContaining({
          content: {
            original: text,
            filtered: text.replace('fuck', '****'),
          }
        }));
      }
    });

    test('Should skip bad words filtering because of configuration change', () => {
      global.strapi.config.custom.plugins.comments.badWords = false;

      expect(checkBadWords(text)).toEqual(text);
    });
  });

  describe('Extracting metadata', () => {
    test('Should extract plugin metadata properly', () => {
      const { model, service, plugin, pluginName } = extractMeta(strapi.plugins);

      expect(model).toHaveProperty('info.name', 'comment');
      expect(service).toHaveProperty('findAll');
      expect(Object.keys(plugin)).toEqual(expect.arrayContaining(['package', 'services', 'models']));
      expect(pluginName).toBe('comments');
    });
  });

  describe('Validating user context', () => {
    test('Context should be skipped based on config', () => {
      global.strapi.config.custom.plugins.comments.enableUsers = false;
      expect(isValidUserContext(undefined)).toEqual(true);
      expect(isValidUserContext({ id: 1 })).toEqual(true);
    });

    test('Context should be verified based on input', () => {
      global.strapi.config.custom.plugins.comments.enableUsers = true;
      expect(isValidUserContext(undefined)).toEqual(false);
      expect(isValidUserContext({ id: 1 })).toEqual(true);
    });
  });

  describe('Resolve user context error', () => {
    test('Should throw 401', () => {
      try {
        resolveUserContextError({ id: 1 });
      } catch (e) {
        expect(e).toBeInstanceOf(PluginError);
        expect(e).toHaveProperty('status', 401);
      }
    });

    test('Should throw 403', () => {
      try {
        resolveUserContextError();
      } catch (e) {
        expect(e).toBeInstanceOf(PluginError);
        expect(e).toHaveProperty('status', 403);
      }
    });
  });
});
