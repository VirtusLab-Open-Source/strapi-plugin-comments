import { CoreStrapi } from '../../@types';
import { getModelUid, getDefaultAuthorPopulate, getOrderBy } from '../utils';
import { caster } from '../../test/utils';

describe('Utils', () => {
  describe('getModelUid', () => {
    it('should return correct uid for a content type', () => {
      const strapi = caster<CoreStrapi>({
        plugin: jest.fn().mockReturnValue({
          contentType: jest.fn().mockReturnValue({ uid: 'plugin::comments.comment' })
        })
      });

      const result = getModelUid(strapi, 'comment');
      expect(result).toBe('plugin::comments.comment');
      expect(strapi.plugin).toHaveBeenCalledWith('comments');
    });
  });

  describe('getDefaultAuthorPopulate', () => {
    it('should return true when avatar is not in attributes', () => {
      const strapi = caster<CoreStrapi>({
        contentType: jest.fn().mockReturnValue({
          attributes: {
            username: { type: 'string' }
          }
        })
      });

      const result = getDefaultAuthorPopulate(strapi);
      expect(result).toBe(true);
    });

    it('should return populate object when avatar exists', () => {
      const strapi = caster<CoreStrapi>({
        contentType: jest.fn().mockReturnValue({
          attributes: {
            avatar: { type: 'media' }
          }
        })
      });

      const result = getDefaultAuthorPopulate(strapi);
      expect(result).toEqual({ populate: { avatar: true } });
    });

    it('should return true when content type is not found', () => {
      const strapi = caster<CoreStrapi>({
        contentType: jest.fn().mockReturnValue(null)
      });

      const result = getDefaultAuthorPopulate(strapi);
      expect(result).toBe(true);
    });
  });

  describe('getOrderBy', () => {
    it('should split orderBy string into array', () => {
      const result = getOrderBy('field:asc');
      expect(result).toEqual(['field', 'asc']);
    });

    it('should return default order when orderBy is null', () => {
      const result = getOrderBy(null);
      expect(result).toEqual(['createdAt', 'desc']);
    });

    it('should return default order when orderBy is undefined', () => {
      const result = getOrderBy(undefined);
      expect(result).toEqual(['createdAt', 'desc']);
    });
  });
});
