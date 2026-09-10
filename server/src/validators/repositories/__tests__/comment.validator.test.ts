import { commentResultValidator } from '../comment.validator';

const commentBase = {
  id: 1,
  documentId: 'comment-doc',
  content: 'A comment',
  blocked: false,
  blockedThread: false,
  blockReason: null,
  isAdminComment: false,
  removed: false,
  approvalStatus: 'APPROVED',
  related: 'api::article.article:1',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  publishedAt: null,
  authorId: null,
  authorName: null,
  authorEmail: null,
  authorAvatar: null,
  locale: null,
};

const nestedReport = {
  id: 10,
  documentId: 'report-doc',
  content: 'Reported as spam',
  reason: 'OTHER',
  resolved: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  publishedAt: null,
  locale: null,
  source: 'USER' as const,
};

describe('commentResultValidator', () => {
  it('should accept nested reports with a defined origin source', () => {
    const result = commentResultValidator.findOne.safeParse({
      ...commentBase,
      reports: [{ ...nestedReport, source: 'AI' }],
    });

    expect(result.success).toBe(true);
  });

  it('should reject nested reports with an unknown source', () => {
    const result = commentResultValidator.findOne.safeParse({
      ...commentBase,
      reports: [{ ...nestedReport, source: 'MODERATOR' }],
    });

    expect(result.success).toBe(false);
  });

  it('should reject nested reports without source', () => {
    const { source: _source, ...reportWithoutSource } = nestedReport;
    const result = commentResultValidator.findOne.safeParse({
      ...commentBase,
      reports: [reportWithoutSource],
    });

    expect(result.success).toBe(false);
  });
});
