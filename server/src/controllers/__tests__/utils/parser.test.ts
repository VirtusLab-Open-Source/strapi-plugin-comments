describe('Parser', () => {
  describe('flatInput', () => {
    const { flatInput } = require('../../utils/parsers');

    it('should handle basic input with default values', () => {
      const input = {};
      const result = flatInput(input);
      
      expect(result).toEqual({
        filters: {
          $or: [{ removed: { $null: true } }, { removed: false }],
          related: undefined,
        },
        populate: {
          threadOf: {
            populate: {
              authorUser: true,
            },
          },
        },
      });
    });

    it('should handle custom filters and preserve existing fields', () => {
      const input = {
        filters: {
          content: 'test content',
          authorName: 'John',
          $or: [{ status: 'pending' }],
        },
        sort: { createdAt: 'desc' },
        fields: ['content', 'authorName'],
        omit: ['removed'],
      };

      const result = flatInput(input);

      expect(result).toEqual({
        ...input,
        filters: {
          ...input.filters,
          $or: [
            { status: 'pending' },
            { removed: { $null: true } },
            { removed: false },
          ],
          related: undefined,
        },
        populate: {
          threadOf: {
            populate: {
              authorUser: true,
            },
          },
        },
      });
    });

    it('should handle populate with author instead of authorUser', () => {
      const input = {
        populate: {
          author: true,
          comments: true,
        },
      };

      const result = flatInput(input);

      expect(result.populate).toEqual({
        authorUser: true,
        comments: true,
        threadOf: {
          populate: {
            authorUser: true,
            comments: true,
          },
        },
      });
    });

    it('should handle pagination and relation', () => {
      const input = {
        pagination: { page: 1, pageSize: 10 },
        relation: 'some-relation',
      };

      const result = flatInput(input);

      expect(result).toEqual({
        pagination: { page: 1, pageSize: 10 },
        relation: 'some-relation',
        filters: {
          $or: [{ removed: { $null: true } }, { removed: false }],
          related: 'some-relation',
        },
        populate: {
          threadOf: {
            populate: {
              authorUser: true,
            },
          },
        },
      });
    });

    it('should handle complex populate configuration', () => {
      const input = {
        populate: {
          author: { populate: true },
          comments: { populate: true },
          reactions: true,
        },
      };

      const result = flatInput(input);

      expect(result.populate).toEqual({
        authorUser: { populate: true },
        comments: { populate: true },
        reactions: true,
        threadOf: {
          populate: {
            authorUser: { populate: true },
            comments: { populate: true },
            reactions: true,
          },
        },
      });
    });
  });
});