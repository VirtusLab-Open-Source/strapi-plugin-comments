import {
  unwrapEither,
  isLeft,
  isRight,
  makeLeft,
  makeRight,
} from '../Either';

describe('Either', () => {
  describe('unwrapEither', () => {
    it('returns right value when right is defined', () => {
      expect(unwrapEither({ right: 'value' })).toBe('value');
    });

    it('returns left value when left is defined', () => {
      expect(unwrapEither({ left: 'error' })).toBe('error');
    });

    it('throws when both left and right are defined', () => {
      expect(() =>
        unwrapEither({ left: 'error', right: 'value' } as any),
      ).toThrow(/Received both left and right values at runtime/);
    });

    it('throws when neither left nor right are defined', () => {
      expect(() => unwrapEither({} as any)).toThrow(
        /Received no left or right values at runtime/,
      );
    });
  });

  describe('isLeft', () => {
    it('returns true when left is defined', () => {
      expect(isLeft({ left: 'error' })).toBe(true);
    });

    it('returns false when right is defined', () => {
      expect(isLeft({ right: 'value' })).toBe(false);
    });
  });

  describe('isRight', () => {
    it('returns true when right is defined', () => {
      expect(isRight({ right: 'value' })).toBe(true);
    });

    it('returns false when left is defined', () => {
      expect(isRight({ left: 'error' })).toBe(false);
    });
  });

  describe('makeLeft', () => {
    it('creates Left with value', () => {
      expect(makeLeft('error')).toEqual({ left: 'error' });
    });
  });

  describe('makeRight', () => {
    it('creates Right with value', () => {
      expect(makeRight('value')).toEqual({ right: 'value' });
    });
  });
});
