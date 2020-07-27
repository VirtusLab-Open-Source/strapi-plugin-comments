const functionsUtils = require('../functions');
const PluginError = require('../error');
const { extractMeta } = require('../functions');

describe('Test Comments service functions utils', () => {
  
  describe('Bad Words filtering', () => {
    const text = 'Lorem ipsum dolor sit fuck amet';

    test('Should find bad words usage and throw error PluginError', () => {
      expect.assertions(6);
      try {
        functionsUtils.checkBadWords(text);
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
  });

  describe('Extracting metadata', () => {
    global.strapi = {
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
      }
    };

    test('Should extract plugin metadata properly', () => {
      const { model, service, plugin, pluginName } = extractMeta(strapi.plugins);

      expect(model).toHaveProperty('info.name', 'comment');
      expect(service).toHaveProperty('findAll');
      expect(Object.keys(plugin)).toEqual(expect.arrayContaining(['package', 'services', 'models']));
      expect(pluginName).toBe('comments');
    });
  });
});
