import { reportResultValidator } from '../reports.validator';

const relatedComment = {
  id: 1,
  documentId: 'comment-doc',
  content: 'A comment',
  blocked: false,
  blockedThread: false,
  blockReason: null,
  authorId: null,
  authorName: null,
  authorEmail: null,
  authorAvatar: null,
  isAdminComment: false,
  removed: false,
  approvalStatus: 'APPROVED',
  related: 'api::article.article:1',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  publishedAt: '2024-01-01T00:00:00.000Z',
  locale: null,
};

const reportBase = {
  id: 10,
  documentId: 'report-doc',
  content: 'Reported as spam',
  reason: 'OTHER',
  resolved: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  publishedAt: null,
  locale: null,
};

describe('reportResultValidator', () => {
  describe('create', () => {
    it('should accept USER and AI sources', () => {
      expect(
        reportResultValidator.create.safeParse({
          ...reportBase,
          related: relatedComment,
          source: 'USER',
        }).success
      ).toBe(true);
      expect(
        reportResultValidator.create.safeParse({
          ...reportBase,
          related: relatedComment,
          source: 'AI',
        }).success
      ).toBe(true);
    });

    it('should accept missing or null source', () => {
      expect(
        reportResultValidator.create.safeParse({
          ...reportBase,
          related: relatedComment,
        }).success
      ).toBe(true);
      expect(
        reportResultValidator.create.safeParse({
          ...reportBase,
          related: relatedComment,
          source: null,
        }).success
      ).toBe(true);
    });

    it('should reject an unknown source', () => {
      expect(
        reportResultValidator.create.safeParse({
          ...reportBase,
          related: relatedComment,
          source: 'MODERATOR',
        }).success
      ).toBe(false);
    });
  });

  describe('findMany', () => {
    it('should accept a report with source and related as an id', () => {
      const result = reportResultValidator.findMany.safeParse([
        {
          ...reportBase,
          related: 1,
          source: 'AI',
        },
      ]);

      expect(result.success).toBe(true);
    });
  });
});
