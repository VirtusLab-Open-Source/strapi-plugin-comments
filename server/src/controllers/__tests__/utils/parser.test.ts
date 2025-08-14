import { omit } from 'lodash';
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
          reports: {
            where: {
              resolved: false,
            },
          },
          threadOf: {
            populate: {
              authorUser: {
                populate: true,
                avatar: {
                  populate: true,
                }
              },
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

      // we expect comments not removed and with status pending
      expect(result).toEqual({
        ...input,
        filters: {
          ...omit(input.filters, '$or'),
          $and: [
            {
              $or: [
                {
                  status: 'pending',
                },
              ],
            },
            {
              $or: [
                {
                  removed: {
                    $null: true,
                  },
                },
                {
                  removed: false,
                },
              ],
            },
          ],
          related: undefined,
        },
        populate: {
          reports: {
            where: {
              resolved: false,
            },
          },
          threadOf: {
            populate: {
              authorUser: {
                populate: true,
                avatar: { populate: true },
              },
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
        reports: {
          where: {
            resolved: false,
          },
        },
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
          reports: {
            where: {
              resolved: false,
            },
          },
          threadOf: {
            populate: {
              authorUser: {
                populate: true,
                avatar: { populate: true },
              },
            },
          },
        },
      });
    });

    it('should handle complex populate configuration', () => {
      const input = {
        populate: {
          reports: { populate: true },
          author: { populate: true },
          comments: { populate: true },
          reactions: true,
        },
      };

      const result = flatInput(input);

      expect(result.populate).toEqual({
        reports: { populate: true },
        authorUser: { populate: true },
        comments: { populate: true },
        reactions: true,
        threadOf: {
          populate: {
            reports: { populate: true },
            authorUser: { populate: true },
            comments: { populate: true },
            reactions: true,
          },
        },
      });
    });

    it('should handle when removed is in $or array', () => {
      const input = {
        filters: {
          content: 'test content',
          $or: [
            { status: 'pending' },
            { removed: true },
            { authorName: 'John' },
          ],
        },
      };

      const result = flatInput(input);

      expect(result).toEqual({
        ...input,
        filters: {
          ...omit(input.filters, '$or'),
          $or: [
            { status: 'pending' },
            { authorName: 'John' },
            { removed: { $null: true } },
            { removed: false },
          ],
          related: undefined,
        },
        populate: {
          reports: {
            where: {
              resolved: false,
            },
          },
          threadOf: {
            populate: {
              authorUser: {
                populate: true,
                avatar: { populate: true },
              },
            },
          },
        },
      });
    });

    it('should handle when removed is not in $or array', () => {
      const input = {
        filters: {
          content: 'test content',
          $or: [{ status: 'pending' }, { authorName: 'John' }],
        },
      };

      const result = flatInput(input);

      expect(result).toEqual({
        ...input,
        filters: {
          ...omit(input.filters, '$or'),
          $and: [
            {
              $or: [{ status: 'pending' }, { authorName: 'John' }],
            },
            {
              $or: [{ removed: { $null: true } }, { removed: false }],
            },
          ],
          related: undefined,
        },
        populate: {
          reports: {
            where: {
              resolved: false,
            },
          },
          threadOf: {
            populate: {
              authorUser: {
                populate: true,
                avatar: { populate: true },
              },
            },
          },
        },
      });
    });

    it('should handle when both $and and $or exist in filters', () => {
      const input = {
        filters: {
          content: 'test content',
          $and: [
            { createdAt: { $gte: '2023-01-01' } },
            { approvalStatus: 'approved' },
          ],
          $or: [{ status: 'pending' }, { authorName: 'John' }],
        },
      };

      const result = flatInput(input);

      expect(result).toEqual({
        ...input,
        filters: {
          ...omit(input.filters, '$or'),
          $and: [
            { createdAt: { $gte: '2023-01-01' } },
            { approvalStatus: 'approved' },
            {
              $or: [{ status: 'pending' }, { authorName: 'John' }],
            },
            {
              $or: [{ removed: { $null: true } }, { removed: false }],
            },
          ],
          related: undefined,
        },
        populate: {
          reports: {
            where: {
              resolved: false,
            },
          },
          threadOf: {
            populate: {
              authorUser: {
                populate: true,
                avatar: { populate: true },
              },
            },
          },
        },
      });
    });
  });
});
