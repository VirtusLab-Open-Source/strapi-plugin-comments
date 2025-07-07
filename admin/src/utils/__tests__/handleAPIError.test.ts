import handleAPIError from '../handleAPIError';

describe('handleAPIError()', () => {
  it('should re-throw error', () => {
    const err = new Error('Error');

    expect(() => handleAPIError(null, jest.fn)).toThrow(Error);
    expect(() => handleAPIError(undefined, jest.fn)).toThrow();
    expect(() => handleAPIError(err, undefined)).toThrow(Error);
    expect(() => handleAPIError(err, jest.fn)).toThrow(err);
  });

  it('should notify app', () => {
    const err = new Error('Error');
    const notify = jest.fn();

    expect(() => handleAPIError(err, notify, 'message')).toThrow(err);
    expect(notify).toHaveBeenCalledWith({
      message: "comments.message",
      type: "warning",
    });
  });
});
