import { isLeft, isRight } from '../../../../utils/Either';
import { AUTHOR_TYPE } from '../../../../utils/constants';
import { findAllPerAuthorValidator } from '../client.controller.validator';

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
