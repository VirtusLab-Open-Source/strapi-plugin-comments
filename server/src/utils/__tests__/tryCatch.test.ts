import { tryCatch } from '../tryCatch';

describe('tryCatch', () => {
  it('returns makeRight with result when callback succeeds', async () => {
    const result = await tryCatch(async () => 'success', 'error');

    expect(result).toEqual({ right: 'success' });
  });

  it('returns makeLeft with throwError when callback throws', async () => {
    const result = await tryCatch(
      async () => {
        throw new Error('failed');
      },
      'caught error',
    );

    expect(result).toEqual({ left: 'caught error' });
  });
});
