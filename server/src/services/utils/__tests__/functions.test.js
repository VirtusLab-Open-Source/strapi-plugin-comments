const PluginError = require('../../../utils/error');
const {
  getRelatedGroups,
  filterOurResolvedReports,
  buildAuthorModel,
  getAuthorName,
  resolveUserContextError,
} = require('../functions');

describe('Test service functions utils', () => {
  describe('getRelatedGroups', () => {
    test('splits and filters related uids', () => {
      const result = getRelatedGroups('api::article.article:1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('filterOurResolvedReports', () => {
    test('returns falsy item when item is falsy', () => {
      expect(filterOurResolvedReports(null)).toBe(null);
      expect(filterOurResolvedReports(undefined)).toBe(undefined);
    });

    test('filters out resolved reports when item has reports', () => {
      const item = {
        id: 1,
        content: 'test',
        reports: [
          { id: 1, resolved: true },
          { id: 2, resolved: false },
        ],
      };
      const result = filterOurResolvedReports(item);
      expect(result.reports).toHaveLength(1);
      expect(result.reports[0].resolved).toBe(false);
    });
  });

  describe('buildAuthorModel', () => {
    test('uses empty array fallback when fieldsToPopulate is not provided', () => {
      const item = {
        id: 1,
        authorUser: {
          id: 10,
          username: 'john',
          email: 'john@test.com',
        },
        content: 'test',
      };
      const result = buildAuthorModel(item, []);
      expect(result.author).toMatchObject({
        id: 10,
        name: 'john',
        email: 'john@test.com',
      });
    });

    test('uses avatar.formats.thumbnail.url when available', () => {
      const item = {
        id: 1,
        authorUser: {
          id: 10,
          username: 'john',
          email: 'john@test.com',
          avatar: {
            url: '/uploads/large.png',
            formats: {
              thumbnail: { url: '/uploads/thumbnail.png' },
            },
          },
        },
        content: 'test',
      };
      const result = buildAuthorModel(item, []);
      expect(result.author.avatar).toBe('/uploads/thumbnail.png');
    });

    test('falls back to avatar.url when formats.thumbnail is not available', () => {
      const item = {
        id: 1,
        authorUser: {
          id: 10,
          username: 'john',
          email: 'john@test.com',
          avatar: {
            url: '/uploads/avatar.png',
          },
        },
        content: 'test',
      };
      const result = buildAuthorModel(item, []);
      expect(result.author.avatar).toBe('/uploads/avatar.png');
    });

    test('reduces authorUser with fieldsToPopulate', () => {
      const item = {
        id: 1,
        authorUser: {
          id: 10,
          username: 'john',
          email: 'john@test.com',
          customField: 'custom',
        },
        content: 'test',
      };
      const result = buildAuthorModel(item, [], ['customField']);
      expect(result.author).toMatchObject({
        id: 10,
        name: 'john',
        email: 'john@test.com',
        customField: 'custom',
      });
    });

    test('filters blocked author props', () => {
      const item = {
        id: 1,
        authorId: 10,
        authorName: 'john',
        authorEmail: 'john@test.com',
        authorAvatar: null,
        content: 'test',
      };
      const result = buildAuthorModel(item, ['email'], []);
      expect(result.author).not.toHaveProperty('email');
      expect(result.author).toMatchObject({ id: 10, name: 'john' });
    });
  });

  describe('getAuthorName', () => {
    test('returns firstname and lastname when both present', () => {
      expect(getAuthorName({ firstname: 'John', lastname: 'Doe' })).toBe('John Doe');
    });

    test('returns username when lastname and firstname are missing', () => {
      expect(getAuthorName({ username: 'johndoe' })).toBe('johndoe');
    });

    test('returns firstname when username is missing', () => {
      expect(getAuthorName({ firstname: 'John' })).toBe('John');
    });

    test('returns empty string when all fields are falsy', () => {
      expect(getAuthorName({})).toBe('');
    });
  });

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
