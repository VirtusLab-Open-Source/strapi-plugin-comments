import { REPORT_REASON } from '../../../../const/REPORT_REASON';
import { isLeft, isRight } from '../../../../utils/Either';
import { APPROVAL_STATUS, AUTHOR_TYPE } from '../../../../utils/constants';
import {
  changeBlockedCommentValidator,
  findAllFlatValidator,
  findAllInHierarchyValidator,
  findAllPerAuthorValidator,
  newCommentValidator,
  removeCommentValidator,
  reportAbuseValidator,
  resolveAbuseReportValidator,
  getCommentResolveMultipleAbuseReportsValidator,
  resolveCommentMultipleAbuseReportsValidator,
  resolveMultipleAbuseReportsValidator,
  updateCommentValidator,
} from '../client.controller.validator';

describe('Client controller validator', () => {
  describe('newCommentValidator', () => {
    it('should return right when all fields are valid', () => {
      const result = newCommentValidator(['api::test.test'], 'api::test.test:1', {
        content: 'test',
      });
      expect(isRight(result)).toBe(true);
      expect(result.right).toMatchObject({
        content: 'test',
        relation: 'api::test.test:1',
      });
    });
    it('should return left when relation is invalid', () => {
      const result = newCommentValidator(['api::test.test'], 'invalid', { content: 'test' });
      expect(isLeft(result)).toBe(true);
    });
    it('should return left when content is invalid', () => {
      const result = newCommentValidator(['api::test.test'], 'api::test.test:1', { content: '' });
      expect(isLeft(result)).toBe(true);
    });
    it('should return left when author is invalid', () => {
      const result = newCommentValidator(['api::test.test'], 'api::test.test:1', {
        content: 'test',
        author: { name: 'test' },
      });
      expect(isLeft(result)).toBe(true);
    });
    it('should return left when threadOf is invalid', () => {
      const result = newCommentValidator(['api::test.test'], 'api::test.test:1', {
        content: 'test',
        threadOf: {},
      });

      expect(isLeft(result)).toBe(true);
    });
    it('should return left when approvalStatus is invalid', () => {
      const result = newCommentValidator(['api::test.test'], 'api::test.test:1', {
        content: 'test',
        approvalStatus: 'invalid',
      });
      expect(isLeft(result)).toBe(true);
    });
    it('should return left when locale is invalid', () => {
      const result = newCommentValidator(['api::test.test'], 'api::test.test:1', {
        content: 'test',
        locale: 12,
      });
      expect(isLeft(result)).toBe(true);
    });
    it('should return left when relation is in valid format but is not in enabled collections', () => {
      const result = newCommentValidator(['api::test.test'], 'api::article.article:1', {
        content: 'test',
      });
      expect(isLeft(result)).toBe(true);
    });
    it('should return right when all fields are provided', () => {
      const result = newCommentValidator(['api::test.test'], 'api::test.test:1', {
        content: 'test',
        author: {
          id: 1,
          name: 'test',
          email: 'test@test.com',
          avatar: 'https://test.com/avatar.png',
        },
        threadOf: 1,
        approvalStatus: APPROVAL_STATUS.APPROVED,
        locale: 'en',
      });
      expect(isRight(result)).toBe(true);
    });
  });

  describe('updateCommentValidator', () => {
    it('should return right when all fields are valid', () => {
      const result = updateCommentValidator(['api::article.article'], {
        content: 'test',
        relation: 'api::article.article:1',
        author: {
          id: 1,
          name: 'test',
          email: 'test@test.com',
          avatar: 'https://test.com/avatar.png',
        },
        commentId: '1',
      });

      expect(isRight(result)).toBe(true);
    });

    it('should return left when content is invalid', () => {
      const result = updateCommentValidator(['api::article.article'], {
        content: '',
        relation: 'api::article.article:1',
        author: {
          id: 1,
          name: 'test',
          email: 'test@test.com',
          avatar: 'https://test.com/avatar.png',
        },
        commentId: '1',
      });
      expect(isLeft(result)).toBe(true);
    });
    it('should return left when relation is invalid', () => {
      const result = updateCommentValidator(['api::article.article'], {
        content: 'test',
        relation: 'invalid',
        author: {
          id: 1,
          name: 'test',
          email: 'test@test.com',
          avatar: 'https://test.com/avatar.png',
        },
        commentId: '1',
      });
      expect(isLeft(result)).toBe(true);
    });
    it('should return left when author is invalid', () => {
      const result = updateCommentValidator(['api::article.article'], {
        content: 'test',
        relation: 'api::article.article:1',
        author: {},
        commentId: '1',
      });
      expect(isLeft(result)).toBe(true);
    });
    it('should return left when commentId is invalid', () => {
      const result = updateCommentValidator(['api::article.article'], {
        content: 'test',
        relation: 'api::article.article:1',
        author: {
          id: 1,
          name: 'test',
          email: 'test@test.com',
          avatar: 'https://test.com/avatar.png',
        },
        commentId: 'invalid',
      });
      expect(isLeft(result)).toBe(true);
    });
    it('should return left when commentId is not provided', () => {
      const result = updateCommentValidator(['api::article.article'], {
        content: 'test',
        relation: 'api::article.article:1',
        author: {
          id: 1,
        },
      });
      expect(isLeft(result)).toBe(true);
    });
  });

  describe('findAllFlatValidator', () => {
    it('should return right when all fields are valid', () => {
      const result = findAllFlatValidator(['api::article.article'], 'api::article.article:1', {
        sort: 'createdAt:desc',
        fields: ['id', 'content'],
        omit: ['removed'],
        isAdmin: false,
        limit: '10',
        skip: '0',
        locale: 'en',
        populate: {
          reports: { populate: true },
          threadOf: { populate: true },
        },
        filters: {
          $and: [{ id: 1 }, { content: 'test' }],
        },
      });
      expect(isRight(result)).toBe(true);
    });
    it('should return left when relation is in valid format but is not in enabled collections', () => {
      const result = findAllFlatValidator(['api::test.test'], 'api::article.article:1', {
        sort: 'createdAt:desc',
        fields: ['id', 'content'],
        omit: ['removed'],
        isAdmin: false,
      });
      expect(isLeft(result)).toBe(true);
    });
    it('should return left when sort is invalid', () => {
      const result = findAllFlatValidator(['api::article.article'], 'api::article.article:1', {
        sort: 'invalid',
      });
      expect(isLeft(result)).toBe(true);
    });
    it('should return left when fields is invalid', () => {
      const result = findAllFlatValidator(['api::article.article'], 'api::article.article:1', {
        fields: [{}],
      });
      expect(isLeft(result)).toBe(true);
    });
    it('should return left when omit is invalid', () => {
      const result = findAllFlatValidator(['api::article.article'], 'api::article.article:1', {
        omit: [{}],
      });
      expect(isLeft(result)).toBe(true);
    });
    it('should return left when limit is invalid', () => {
      const result = findAllFlatValidator(['api::article.article'], 'api::article.article:1', {
        limit: 'invalid',
      });
      expect(isLeft(result)).toBe(true);
    });
    it('should return left when skip is invalid', () => {
      const result = findAllFlatValidator(['api::article.article'], 'api::article.article:1', {
        skip: 'invalid',
      });
      expect(isLeft(result)).toBe(true);
    });
    it('should return left when locale is invalid', () => {
      const result = findAllFlatValidator(['api::article.article'], 'api::article.article:1', {
        locale: 12,
      });
      expect(isLeft(result)).toBe(true);
    });
    it('should return left when populate is invalid', () => {
      const result = findAllFlatValidator(['api::article.article'], 'api::article.article:1', {
        populate: {
          reports: [],
        },
      });
      expect(isLeft(result)).toBe(true);
    });
    it('should return left when filters is invalid', () => {
      const result = findAllFlatValidator(['api::article.article'], 'api::article.article:1', {
        filters: {
          $and: [],
        },
      });
      expect(isLeft(result)).toBe(true);
    });

    it('should return left when pagination is invalid', () => {
      const result = findAllFlatValidator(['api::article.article'], 'api::article.article:1', {
        pagination: {
          pageSize: 'invalid',
        },
      });
      expect(isLeft(result)).toBe(true);
    });

    it('should return left when page is invalid', () => {
      const result = findAllFlatValidator(['api::article.article'], 'api::article.article:1', {
        pagination: {
          page: 'invalid',
        },
      });
      expect(isLeft(result)).toBe(true);
    });

    it('should return left when pageSize is invalid', () => {
      const result = findAllFlatValidator(['api::article.article'], 'api::article.article:1', {
        pagination: {
          pageSize: 'invalid',
        },
      });

      expect(isLeft(result)).toBe(true);
    });

    it('should return left when withCount is invalid', () => {
      const result = findAllFlatValidator(['api::article.article'], 'api::article.article:1', {
        pagination: {
          withCount: {},
        },
      });

      expect(isLeft(result)).toBe(true);
    });
  });

  describe('findAllInHierarchyValidator', () => {
    it('should return right when all fields are valid', () => {
      const result = findAllInHierarchyValidator(
        ['api::article.article'],
        'api::article.article:1',
        {
          sort: 'createdAt:desc',
          fields: ['id', 'content'],
          omit: ['removed'],
          isAdmin: false,
          limit: '10',
          skip: '0',
          locale: 'en',
          populate: {
            reports: { populate: true },
            threadOf: { populate: true },
          },
          filters: {
            $and: [{ id: 1 }, { content: 'test' }],
          },
        }
      );
      expect(isRight(result)).toBe(true);
    });
    it('should return left when relation is in valid format but is not in enabled collections', () => {
      const result = findAllInHierarchyValidator(['api::test.test'], 'api::article.article:1', {
        sort: 'createdAt:desc',
        fields: ['id', 'content'],
        omit: ['removed'],
        isAdmin: false,
      });
      expect(isLeft(result)).toBe(true);
    });
    it('should return left when sort is invalid', () => {
      const result = findAllInHierarchyValidator(
        ['api::article.article'],
        'api::article.article:1',
        {
          sort: 'invalid',
        }
      );
      expect(isLeft(result)).toBe(true);
    });
    it('should return left when fields is invalid', () => {
      const result = findAllInHierarchyValidator(
        ['api::article.article'],
        'api::article.article:1',
        {
          fields: [{}],
        }
      );
      expect(isLeft(result)).toBe(true);
    });
    it('should return left when omit is invalid', () => {
      const result = findAllInHierarchyValidator(
        ['api::article.article'],
        'api::article.article:1',
        {
          omit: [{}],
        }
      );
      expect(isLeft(result)).toBe(true);
    });
    it('should return left when limit is invalid', () => {
      const result = findAllInHierarchyValidator(
        ['api::article.article'],
        'api::article.article:1',
        {
          limit: 'invalid',
        }
      );
      expect(isLeft(result)).toBe(true);
    });
    it('should return left when skip is invalid', () => {
      const result = findAllInHierarchyValidator(
        ['api::article.article'],
        'api::article.article:1',
        {
          skip: 'invalid',
        }
      );
      expect(isLeft(result)).toBe(true);
    });
    it('should return left when locale is invalid', () => {
      const result = findAllInHierarchyValidator(
        ['api::article.article'],
        'api::article.article:1',
        {
          locale: 12,
        }
      );
      expect(isLeft(result)).toBe(true);
    });
    it('should return left when populate is invalid', () => {
      const result = findAllInHierarchyValidator(
        ['api::article.article'],
        'api::article.article:1',
        {
          populate: {
            reports: [],
          },
        }
      );
      expect(isLeft(result)).toBe(true);
    });
    it('should return left when filters is invalid', () => {
      const result = findAllInHierarchyValidator(
        ['api::article.article'],
        'api::article.article:1',
        {
          filters: {
            $and: [],
          },
        }
      );
      expect(isLeft(result)).toBe(true);
    });
    it('should return left when startingFromId is invalid', () => {
      const result = findAllInHierarchyValidator(
        ['api::article.article'],
        'api::article.article:1',
        {
          startingFromId: 'invalid',
        }
      );
      expect(isLeft(result)).toBe(true);
    });
    it('should return left when dropBlockedThreads is invalid', () => {
      const result = findAllInHierarchyValidator(
        ['api::article.article'],
        'api::article.article:1',
        {
          dropBlockedThreads: 'invalid',
        }
      );
      expect(isLeft(result)).toBe(true);
    });
  });

  describe('findAllPerAuthorValidator', () => {
    it('should return right when authorId is provided but type is not provided', () => {
      const result = findAllPerAuthorValidator({ authorId: '1' }, {});

      expect(isRight(result)).toBe(true);
    });
    it('should accept type GENERIC with valid authorId', () => {
      const result = findAllPerAuthorValidator({ authorId: '1', type: AUTHOR_TYPE.GENERIC }, {});

      expect(isRight(result)).toBe(true);
    });
    it('should accept type STRAPI with valid authorId', () => {
      const result = findAllPerAuthorValidator({ authorId: '1', type: AUTHOR_TYPE.STRAPI }, {});

      expect(isRight(result)).toBe(true);
    });
    it('should reject invalid type', () => {
      const result = findAllPerAuthorValidator({ authorId: '1', type: 'invalid' }, {});

      expect(isLeft(result)).toBe(true);
    });
    it('should reject when authorId is missing', () => {
      const result = findAllPerAuthorValidator({}, {});

      expect(isLeft(result)).toBe(true);
    });
    it('should accept lowercase strapi type', () => {
      const result = findAllPerAuthorValidator({ authorId: '1', type: 'strapi' }, {});

      expect(isRight(result)).toBe(true);
    });
    it('should accept lowercase generic type', () => {
      const result = findAllPerAuthorValidator({ authorId: '1', type: 'generic' }, {});

      expect(isRight(result)).toBe(true);
    });
    it('should accept numeric authorId', () => {
      const result = findAllPerAuthorValidator({ authorId: 1 }, {});

      expect(isRight(result)).toBe(true);
    });
    it('should return parsed authorId and type in right value', () => {
      const result = findAllPerAuthorValidator({ authorId: '1', type: AUTHOR_TYPE.STRAPI }, {});

      expect(isRight(result)).toBe(true);
      expect(result.right).toMatchObject({ authorId: '1', type: AUTHOR_TYPE.STRAPI });
    });
  });

  describe('reportAbuseValidator', () => {
    it('should return right when all fields are valid', () => {
      const result = reportAbuseValidator(
        {
          enabledCollections: ['api::article.article'],
          reportReasons: {
            BAD_LANGUAGE: REPORT_REASON.BAD_LANGUAGE,
          },
        },
        {
          reason: 'BAD_LANGUAGE',
          content: 'tedadadasst',
          commentId: '1',
          relation: 'api::article.article:1',
        }
      );
      expect(isRight(result)).toBe(true);
    });

    it('should return left when reason is invalid', () => {
      const result = reportAbuseValidator(
        {
          enabledCollections: ['api::article.article'],
          reportReasons: {
            BAD_LANGUAGE: REPORT_REASON.BAD_LANGUAGE,
          },
        },
        {
          reason: 'invalid',
          content: 'tedadadasst',
          commentId: '1',
          relation: 'api::article.article:1',
        }
      );
      expect(isLeft(result)).toBe(true);
    });

    it('should return left when content is invalid', () => {
      const result = reportAbuseValidator(
        {
          enabledCollections: ['api::article.article'],
          reportReasons: {
            BAD_LANGUAGE: REPORT_REASON.BAD_LANGUAGE,
          },
        },
        {
          reason: 'BAD_LANGUAGE',
          content: '',
          commentId: '1',
          relation: 'api::article.article:1',
        }
      );
      expect(isLeft(result)).toBe(true);
    });
    it('should return left when commentId is invalid', () => {
      const result = reportAbuseValidator(
        {
          enabledCollections: ['api::article.article'],
          reportReasons: {
            BAD_LANGUAGE: REPORT_REASON.BAD_LANGUAGE,
          },
        },
        {
          reason: 'BAD_LANGUAGE',
          content: 'tedadadasst',
          commentId: 'invalid',
          relation: 'api::article.article:1',
        }
      );
      expect(isLeft(result)).toBe(true);
    });
    it('should return left when relation is invalid', () => {
      const result = reportAbuseValidator(
        {
          enabledCollections: ['api::article.article'],
          reportReasons: {
            BAD_LANGUAGE: REPORT_REASON.BAD_LANGUAGE,
          },
        },
        {
          reason: 'BAD_LANGUAGE',
          content: 'tedadadasst',
          commentId: '1',
          relation: 'invalid',
        }
      );
      expect(isLeft(result)).toBe(true);
    });
  });

  describe('removeCommentValidator', () => {
    it('should return right when all fields are valid', () => {
      const result = removeCommentValidator(['api::article.article'], {
        commentId: '1',
        relation: 'api::article.article:1',
        authorId: '1',
      });
      expect(isRight(result)).toBe(true);
    });
    it('should return left when commentId is invalid', () => {
      const result = removeCommentValidator(['api::article.article'], {
        commentId: null,
        relation: 'api::article.article:1',
        authorId: '1',
      });
      expect(isLeft(result)).toBe(true);
    });
    it('should return left when relation is invalid', () => {
      const result = removeCommentValidator(['api::article.article'], {
        commentId: '1',
        relation: 'invalid',
        authorId: '1',
      });
      expect(isLeft(result)).toBe(true);
    });
    it('should return left when authorId is invalid', () => {
      const result = removeCommentValidator(['api::article.article'], {
        commentId: '1',
        relation: 'api::article.article:1',
        authorId: null,
      });
      expect(isLeft(result)).toBe(true);
    });
  });

  describe('changeBlockedCommentValidator', () => {
    it('should return right when relation and commentId are valid', () => {
      const result = changeBlockedCommentValidator(['api::test.test'], {
        relation: 'api::test.test:1',
        commentId: '5',
      });
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toEqual({
          relation: 'api::test.test:1',
          commentId: '5',
        });
      }
    });

    it('should return left when relation is not enabled', () => {
      const result = changeBlockedCommentValidator(['api::test.test'], {
        relation: 'api::other.other:1',
        commentId: 1,
      });
      expect(isLeft(result)).toBe(true);
    });
  });

  describe('resolveAbuseReportValidator', () => {
    it('should return right when relation, commentId and reportId are valid', () => {
      const result = resolveAbuseReportValidator(['api::test.test'], {
        relation: 'api::test.test:1',
        commentId: '1',
        reportId: '9',
      });
      expect(isRight(result)).toBe(true);
    });

    it('should return left when reportId is missing', () => {
      const result = resolveAbuseReportValidator(['api::test.test'], {
        relation: 'api::test.test:1',
        commentId: '1',
      });
      expect(isLeft(result)).toBe(true);
    });
  });

  describe('resolveCommentMultipleAbuseReportsValidator', () => {
    it('should return right with reportIds', () => {
      const result = resolveCommentMultipleAbuseReportsValidator(['api::test.test'], {
        relation: 'api::test.test:1',
        commentId: 1,
        reportIds: [10, 11],
      });
      expect(isRight(result)).toBe(true);
    });

    it('should return left when reportIds is empty', () => {
      const result = resolveCommentMultipleAbuseReportsValidator(['api::test.test'], {
        relation: 'api::test.test:1',
        commentId: 1,
        reportIds: [],
      });
      expect(isLeft(result)).toBe(true);
    });
  });

  describe('getCommentResolveMultipleAbuseReportsValidator', () => {
    it('should merge body then override relation and commentId from params (like admin)', () => {
      const result = getCommentResolveMultipleAbuseReportsValidator(
        ['api::test.test'],
        { relation: 'api::test.test:1', commentId: '2' },
        { reportIds: [10, 11], relation: 'api::other.other:9', commentId: '99' },
      );
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right.relation).toBe('api::test.test:1');
        expect(result.right.commentId).toBe(2);
        expect(result.right.reportIds).toEqual([10, 11]);
      }
    });

    it('should return left when body omits reportIds even if params are set', () => {
      const result = getCommentResolveMultipleAbuseReportsValidator(
        ['api::test.test'],
        { relation: 'api::test.test:1', commentId: '1' },
        {},
      );
      expect(isLeft(result)).toBe(true);
    });

    it('should return right with reportIds in body only', () => {
      const result = getCommentResolveMultipleAbuseReportsValidator(
        ['api::test.test'],
        { relation: 'api::test.test:1', commentId: '1' },
        { reportIds: [10, 11] },
      );
      expect(isRight(result)).toBe(true);
    });
  });

  describe('resolveMultipleAbuseReportsValidator', () => {
    it('should return right with relation and reportIds in body', () => {
      const result = resolveMultipleAbuseReportsValidator(
        ['api::test.test'],
        'api::test.test:1',
        { reportIds: [1, 2] }
      );
      expect(isRight(result)).toBe(true);
    });

    it('should return left when relation is not enabled', () => {
      const result = resolveMultipleAbuseReportsValidator(
        ['api::test.test'],
        'api::other.other:1',
        { reportIds: [1] }
      );
      expect(isLeft(result)).toBe(true);
    });
  });
});
