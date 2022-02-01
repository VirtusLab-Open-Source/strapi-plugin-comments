const PluginError = require('../../../utils/error');
const { checkBadWords, extractMeta, isValidUserContext, resolveUserContextError, getModelUid } = require('../functions');

beforeEach(() => {
  Object.defineProperty(global, 'strapi', {
    value: {
      plugin: function(name) {
        return this.plugins[name];
      },
      plugins: {
        comments: {
          package: require('../../../../package.json'),
          services: {
            common: require('../../common'),
            client: require('../../client'),
            admin: require('../../admin'),
          },
          contentTypes: {
            comment: {
              ...require('../../../../content-types/comment'),
              uid: 'plugins::comments.comment',
            },
            'comment-report': {
              ...require('../../../../content-types/report'),
              uid: 'plugins::comments.comment-report'
            },
          }
        }
      },
      config: {
        plugins: {
          comments: {
            approvalFlow: ['api::blog-post.blog-post'],
            entryLabel: {
              'api::blog-post.blog-post': ['alternative_subject'],
            },
          }
        }
      }
    },
    writable: true,
  });
})

describe('Test Comments service functions utils', () => {

  // describe('Bad Words filtering', () => {
  //   const text = 'Lorem ipsum dolor sit fuck amet';

  //   test('Should find bad words usage and throw error PluginError', () => {
  //     expect.assertions(6);
  //     try {
  //       checkBadWords(text);
  //     } catch (e) {
  //       expect(e).toBeInstanceOf(PluginError);
  //       expect(e).toHaveProperty('status', 400);
  //       expect(e).toHaveProperty('name', 'Strapi:Plugin:Comments');
  //       expect(e).toHaveProperty('message', 'Bad language used! Please polite your comment...');
  //       expect(e).toHaveProperty('payload');
  //       expect(e.payload).toEqual(expect.objectContaining({
  //         content: {
  //           original: text,
  //           filtered: text.replace('fuck', '****'),
  //         }
  //       }));
  //     }
  //   });

  //   test('Should skip bad words filtering because of configuration change', () => {
  //     global.strapi.config.plugins.comments.badWords = false;

  //     expect(checkBadWords(text)).toEqual(text);
  //   });
  // });

  describe('Getting models uid\'s ', () => {
    test('Should get comments uid', () => {
      expect(getModelUid('comment')).toBe('plugins::comments.comment');
    });

    test('Should get report uid', () => {
      expect(getModelUid('comment-report')).toBe('plugins::comments.comment-report');
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
