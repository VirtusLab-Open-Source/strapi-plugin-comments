import PluginError from '../error';

describe('PluginError (error)', () => {
  it('creates error with status, message and optional payload', () => {
    const err = new PluginError(400, 'Bad request', { field: 'email' });
    expect(err.status).toBe(400);
    expect(err.message).toBe('Bad request');
    expect(err.payload).toEqual({ field: 'email' });
  });

  it('uses default status 500 when status is falsy', () => {
    const err = new PluginError(0, 'Error');
    expect(err.status).toBe(500);
  });

  it('uses default message when message is falsy', () => {
    const err = new PluginError(500, '');
    expect(err.message).toBe('Internal error');
  });

  describe('toString', () => {
    it('returns formatted string', () => {
      const err = new PluginError(400, 'Bad request');
      expect(err.toString()).toBe('Strapi:Plugin:Comments - Bad request');
    });

    it('accepts custom error parameter', () => {
      const err = new PluginError(400, 'Bad request');
      const other = new PluginError(404, 'Not found');
      expect(err.toString(other)).toBe('Strapi:Plugin:Comments - Not found');
    });
  });

  describe('toJSON', () => {
    it('returns payload merged with name and message when payload exists', () => {
      const err = new PluginError(400, 'Bad request', { field: 'email' });
      expect(err.toJSON()).toEqual({
        field: 'email',
        name: 'Strapi:Plugin:Comments',
        message: 'Bad request',
      });
    });

    it('returns this when payload is undefined', () => {
      const err = new PluginError(400, 'Bad request');
      expect(err.toJSON()).toBe(err);
    });
  });
});
