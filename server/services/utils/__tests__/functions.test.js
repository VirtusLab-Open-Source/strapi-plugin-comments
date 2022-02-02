const PluginError = require('../../../utils/error');
const { resolveUserContextError, getModelUid } = require('../functions');

beforeEach(() => {
  Object.defineProperty(global, 'strapi', {
    value: require('../../../../__mocks__/initSetup')(),
    writable: true,
  });
})

describe('Test service functions utils', () => {

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
