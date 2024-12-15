import { CoreStrapi } from '../../@types';
import { caster } from '../../test/utils';
import { getConfig } from '../../utils/getConfig';
import { commentResultValidator } from '../../validators/repositories';
import { getCommentRepositorySource } from '../comment.repository';

jest.mock('../../utils/getConfig', () => ({
  getConfig: jest.fn(),
}));


jest.mock('../../validators/repositories', () => ({
  commentResultValidator: {
    findMany: { parseAsync: jest.fn().mockImplementation(value => value) },
    findWithCount: { parseAsync: jest.fn().mockImplementation(value => value) },
    findOne: { parseAsync: jest.fn().mockImplementation(value => value) },
    create: { parseAsync: jest.fn().mockImplementation(value => value) },
  },
  shouldValidateArray: jest.fn(),
  shouldValidateObject: jest.fn(),
}));

describe('Comment repository', () => {
  const UID = 'plugin::comments.comment';

  beforeEach(() => {
    jest.resetAllMocks();
  });

  const getStrapi = () => caster<CoreStrapi>({
    plugin: jest.fn().mockReturnValue({ contentType: jest.fn().mockReturnValue({ uid: UID }) }),
    query: jest.fn().mockReturnValue({
      findMany: jest.fn(),
      findPage: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
    }),
  });

  const getRepository = (strapi: CoreStrapi) => getCommentRepositorySource(strapi);

  describe('when getConfig returns false', () => {
    beforeEach(() => {
      caster<jest.Mock>(getConfig).mockResolvedValue(false);
    });


    it('findMany returns not validated comments', async () => {
      const params = {};
      const strapi = getStrapi();
      const comments = [{ id: 1, content: 'Test comment' }];
      caster<jest.Mock>(strapi.query(UID).findMany).mockResolvedValue(comments);

      const result = await getRepository(strapi).findMany(params);

      expect(result).toEqual(comments);
      expect(commentResultValidator.findMany.parseAsync).not.toHaveBeenCalled();
    });

    it('findWithCount returns not validated comments with count', async () => {
      const params = {};
      const strapi = getStrapi();
      const commentsWithCount = { results: [{ id: 1, content: 'Test comment' }], pagination: { total: 1 } };
      caster<jest.Mock>(strapi.query(UID).findPage).mockResolvedValue(commentsWithCount);

      const result = await getRepository(strapi).findWithCount(params);

      expect(result).toEqual(commentsWithCount);
      expect(commentResultValidator.findWithCount.parseAsync).not.toHaveBeenCalled();
    });

    it('findOne returns not validated comment', async () => {
      const params = { where: { id: 1 } };
      const comment = { id: 1, content: 'Test comment' };
      const strapi = getStrapi();
      caster<jest.Mock>(strapi.query(UID).findOne).mockResolvedValue(comment);

      const result = await getRepository(strapi).findOne(params);

      expect(result).toEqual(comment);
      expect(commentResultValidator.findOne.parseAsync).not.toHaveBeenCalled();
    });

    it('findOne returns null if comment not found', async () => {
      const params = { where: { id: 1 } };
      const strapi = getStrapi();
      caster<jest.Mock>(strapi.query(UID).findOne).mockResolvedValue(null);

      const result = await getRepository(strapi).findOne(params);

      expect(result).toBeNull();
      expect(commentResultValidator.findOne.parseAsync).not.toHaveBeenCalled();
    });

    it('update returns updated comment', async () => {
      const params = { where: { id: 1 }, data: { content: 'Updated comment' } };
      const updatedComment = { id: 1, content: 'Updated comment' };
      const strapi = getStrapi();
      caster<jest.Mock>(strapi.query(UID).update).mockResolvedValue(updatedComment);

      const result = await getRepository(strapi).update(params);

      expect(result).toEqual(updatedComment);
      expect(commentResultValidator.findOne.parseAsync).not.toHaveBeenCalled();
    });


    it('delete returns deleted comment', async () => {
      const params = { where: { id: 1 } };
      const deletedComment = { id: 1, content: 'Deleted comment' };
      const strapi = getStrapi();
      caster<jest.Mock>(strapi.query(UID).delete).mockResolvedValue(deletedComment);

      const result = await getRepository(strapi).delete(params);

      expect(result).toEqual(deletedComment);
      expect(commentResultValidator.findOne.parseAsync).not.toHaveBeenCalled();

    });

    it('delete returns null if comment not found', async () => {
      const params = { where: { id: 1 } };
      const strapi = getStrapi();
      caster<jest.Mock>(strapi.query(UID).delete).mockResolvedValue(null);

      const result = await getRepository(strapi).delete(params);

      expect(result).toBeNull();
      expect(commentResultValidator.findOne.parseAsync).not.toHaveBeenCalled();
    });

    it('create returns created comment', async () => {
      const params = { data: { content: 'New comment' }, populate: [] };
      const createdComment = { id: 1, content: 'New comment' };
      const strapi = getStrapi();
      caster<jest.Mock>(strapi.query(UID).create).mockResolvedValue(createdComment);

      const result = await getRepository(strapi).create(params);

      expect(result).toEqual(createdComment);
      expect(commentResultValidator.create.parseAsync).not.toHaveBeenCalled();

    });

    it('updateMany updates multiple comments', async () => {
      const params = { data: { content: 'Updated comment' }, where: { id_in: [1, 2] } };
      const strapi = getStrapi();
      caster<jest.Mock>(strapi.query(UID).updateMany).mockResolvedValue(undefined);

      await getRepository(strapi).updateMany(params);

      expect(strapi.query(UID).updateMany).toHaveBeenCalledWith(params);
    });
  });
  describe('when getConfig returns true', () => {
    beforeEach(() => {
      caster<jest.Mock>(getConfig).mockResolvedValue(true);
      Object.keys(commentResultValidator).forEach(key => {
        commentResultValidator[key] = { parseAsync: jest.fn().mockImplementation(value => value) };
      });
    });

    it('findMany returns validated comments', async () => {
      const params = {};
      const strapi = getStrapi();
      const comments = [{ id: 1, content: 'Test comment' }];
      caster<jest.Mock>(strapi.query(UID).findMany).mockResolvedValue(comments);

      const result = await getRepository(strapi).findMany(params);

      expect(result).toEqual(comments);
      expect(commentResultValidator.findMany.parseAsync).toHaveBeenCalled();
    });

    it('findWithCount returns validated comments with count', async () => {
      const params = {};
      const strapi = getStrapi();
      const commentsWithCount = { results: [{ id: 1, content: 'Test comment' }], pagination: { total: 1 } };
      caster<jest.Mock>(strapi.query(UID).findPage).mockResolvedValue(commentsWithCount);

      const result = await getRepository(strapi).findWithCount(params);

      expect(result).toEqual(commentsWithCount);
      expect(commentResultValidator.findWithCount.parseAsync).toHaveBeenCalled();
    });

    it('findOne returns validated comment', async () => {
      const params = { where: { id: 1 } };
      const comment = { id: 1, content: 'Test comment' };
      const strapi = getStrapi();
      caster<jest.Mock>(strapi.query(UID).findOne).mockResolvedValue(comment);

      const result = await getRepository(strapi).findOne(params);

      expect(result).toEqual(comment);
      expect(commentResultValidator.findOne.parseAsync).toHaveBeenCalled();
    });

    it('findOne returns null if comment not found', async () => {
      const params = { where: { id: 1 } };
      const strapi = getStrapi();
      caster<jest.Mock>(strapi.query(UID).findOne).mockResolvedValue(null);

      const result = await getRepository(strapi).findOne(params);

      expect(result).toBeNull();
    });

    it('update returns validated updated comment', async () => {
      const params = { where: { id: 1 }, data: { content: 'Updated comment' } };
      const updatedComment = { id: 1, content: 'Updated comment' };
      const strapi = getStrapi();
      caster<jest.Mock>(strapi.query(UID).update).mockResolvedValue(updatedComment);

      const result = await getRepository(strapi).update(params);

      expect(result).toEqual(updatedComment);
      expect(commentResultValidator.findOne.parseAsync).toHaveBeenCalled();
    });


    it('delete returns validated deleted comment', async () => {
      const params = { where: { id: 1 } };
      const deletedComment = { id: 1, content: 'Deleted comment' };
      const strapi = getStrapi();
      caster<jest.Mock>(strapi.query(UID).delete).mockResolvedValue(deletedComment);

      const result = await getRepository(strapi).delete(params);

      expect(result).toEqual(deletedComment);
      expect(commentResultValidator.findOne.parseAsync).toHaveBeenCalled();

    });

    it('create returns created comment', async () => {
      const params = { data: { content: 'New comment' }, populate: [] };
      const createdComment = { id: 1, content: 'New comment' };
      const strapi = getStrapi();
      caster<jest.Mock>(strapi.query(UID).create).mockResolvedValue(createdComment);

      const result = await getRepository(strapi).create(params);

      expect(result).toEqual(createdComment);
      expect(commentResultValidator.create.parseAsync).toHaveBeenCalled();

    });

  });
});
