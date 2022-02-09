const PluginError = require('../../utils/error');
const { getPluginService } = require('../../utils/functions');

jest.mock


const setup = function(config) {
  Object.defineProperty(global, 'strapi', {
    value: require('../../../__mocks__/initSetup')(config),
    writable: true,
  });
}

afterEach(() => {
  Object.defineProperty(global, 'strapi', {});
})

describe('Test Comments service functions utils', () => {

  describe('Get plugin config', () => {
    beforeEach(() => setup({
      test: 'sample',
    }));

    test('Should return config value', async () => {
      const result = await getPluginService('common').getConfig('test');
      expect(result).toEqual('sample');
    });

    test('Should return default config prop value if not set', async () => {
      const result = await getPluginService('common').getConfig('another', 'defaultValue');
      expect(result).toEqual('defaultValue');
    });
  });

  describe('Validate user context', () => {
    beforeEach(() => setup());

    test('Should context be valid', () => {
      expect(getPluginService('common').isValidUserContext({ id: 1 })).toEqual(true);
    });

    test('Should context be invalid', () => {
      expect(getPluginService('common').isValidUserContext({ })).toEqual(false);
    });

    test('Should use fallback', () => {
      expect(getPluginService('common').isValidUserContext()).toEqual(true);
    });
  });

  describe('Sanitize comments entity', () => {
    beforeEach(() => setup());

    const sample = {
      id: 1,
      content: 'Test text',
      blocked: false,
      removed: true,
    };

    const authorSample = {
      id: 1,
      username: 'Joe Doe',
      email: 'test@example.com',
      password: 'xxx',
    };

    const authorGenericSample = {
      authorId: 1,
      authorName: 'Joe Doe',
      authorEmail: 'test@example.com',
    };

    const outputAuthorSample = {
      id: 1,
      name: 'Joe Doe',
      email: 'test@example.com',
    };

    test('Should return exact the same value', () => {
      const input = { ...sample };
      const output = getPluginService('common').sanitizeCommentEntity(input);
      expect(output).toHaveProperty('id', input.id);
      expect(output).toHaveProperty('content', input.content);
      expect(output).toHaveProperty('blocked', input.blocked);
      expect(output).toHaveProperty('removed', input.removed);
    });

    test('Should return entity with \'author\' property for generic author', () => {
      const input = {
        ...sample,
        ...authorGenericSample,
      };
      const output = getPluginService('common').sanitizeCommentEntity(input);

      expect(output).toHaveProperty('author');
      expect(output).toHaveProperty('author.id', input.authorId);
      expect(output).toHaveProperty('author.id', outputAuthorSample.id);
      expect(output).toHaveProperty('author.name', input.authorName);
      expect(output).toHaveProperty('author.name', outputAuthorSample.name);
      expect(output).toHaveProperty('author.email', input.authorEmail);
      expect(output).toHaveProperty('author.email', outputAuthorSample.email);

      expect(output).not.toHaveProperty('authorId');
      expect(output).not.toHaveProperty('authorName');
      expect(output).not.toHaveProperty('authorEmail');
    });

    test('Should return entity with \'author\' property for Strapi author', () => {
      const input = {
        ...sample,
        authorUser: authorSample,
      };
      const output = getPluginService('common').sanitizeCommentEntity(input);

      expect(output).toHaveProperty('author');
      expect(output).toHaveProperty('author.id', input.authorUser.id);
      expect(output).toHaveProperty('author.id', outputAuthorSample.id);
      expect(output).toHaveProperty('author.name', input.authorUser.username);
      expect(output).toHaveProperty('author.name', outputAuthorSample.name);
      expect(output).toHaveProperty('author.email', input.authorUser.email);
      expect(output).toHaveProperty('author.email', outputAuthorSample.email);

      expect(output).not.toHaveProperty('authorUser');

      expect(output).not.toHaveProperty('author.password');
    });
  });

  describe('Bad Words filtering', () => {
    beforeEach(() => setup());

    const text = 'Lorem ipsum dolor sit fuck amet';

    test('Should find bad words usage and throw error PluginError', async () => {
      expect.assertions(7);
      try {
        await getPluginService('common').checkBadWords(text);
      } catch (e) {
        expect(getPluginService('common').getConfig('badWords')).toEqual(undefined);
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

  describe('Bad Words filtering', () => {
    beforeEach(() => setup({ badWords: false }));

    const text = 'Lorem ipsum dolor sit fuck amet';

    test('Should skip bad words filtering because of configuration change', async () => {
      expect(await getPluginService('common').getConfig('badWords')).toEqual(false);
      expect(await getPluginService('common').checkBadWords(text)).toEqual(text);
    });
  });
});
