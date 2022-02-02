const { getPluginService } = require('../functions');

beforeEach(() => {
  Object.defineProperty(global, 'strapi', {
    value: require('../../../__mocks__/initSetup')(),
    writable: true,
  });
})

describe('Test plugin functions utils', () => {

  describe('Get plugin service', () => {
    test('Should get common service', () => {
      expect(getPluginService('common')).toHaveProperty('findAllFlat');
    });
  });
});
