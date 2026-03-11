import { caster } from '../../test/utils';
import PluginError from '../PluginError';
import { throwError } from '../throwError';

describe('throwError', () => {
  it('calls ctx.throw with status and JSON when error is PluginError', () => {
    const ctx = caster<any>({
      throw: jest.fn(),
    });
    const err = new PluginError(400, 'Bad request', { field: 'email' });

    throwError(ctx, err);

    expect(ctx.throw).toHaveBeenCalledWith(400, expect.any(String));
    expect(JSON.parse(ctx.throw.mock.calls[0][1])).toMatchObject({
      name: 'Strapi:Plugin:Comments',
      message: 'Bad request',
    });
  });

  it('returns error when error is not PluginError', () => {
    const ctx = caster<any>({ throw: jest.fn() });
    const err = new Error('Generic error');

    const result = throwError(ctx, err);

    expect(result).toBe(err);
    expect(ctx.throw).not.toHaveBeenCalled();
  });

  it('returns error when error is unknown', () => {
    const ctx = caster<any>({ throw: jest.fn() });
    const err = 'string error';

    const result = throwError(ctx, err);

    expect(result).toBe(err);
    expect(ctx.throw).not.toHaveBeenCalled();
  });
});
