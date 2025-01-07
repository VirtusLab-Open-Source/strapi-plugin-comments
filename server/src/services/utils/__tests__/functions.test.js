const PluginError = require('../../../utils/error');
const {
  resolveUserContextError,
} = require('../functions');

describe('Test service functions utils', () => {

  describe('Resolve user context error', () => {
    test('Should throw 401', () => {
      try {
        resolveUserContextError({ id: 1 });
      } catch (e) {
        expect(e).toBeInstanceOf(PluginError.default);
        expect(e).toHaveProperty('status', 401);
      }
    });

    test('Should throw 403', () => {
      try {
        resolveUserContextError();
      } catch (e) {
        expect(e).toBeInstanceOf(PluginError.default);
        expect(e).toHaveProperty('status', 403);
      }
    });
  });
});
