import { CoreStrapi } from '../../@types';
import { caster } from '../../test/utils';
import { getConfig } from '../../utils/getConfig';
import { reportResultValidator } from '../../validators/repositories';
import { getReportCommentRepositorySource } from '../report.comment.repository';

jest.mock('../../utils/getConfig', () => ({
  getConfig: jest.fn(),
}));

jest.mock('../../validators/repositories', () => ({
  reportResultValidator: {
    findMany: { parseAsync: jest.fn().mockImplementation(value => value) },
    findPage: { parseAsync: jest.fn().mockImplementation(value => value) },
    update: { parseAsync: jest.fn().mockImplementation(value => value) },
    create: { parseAsync: jest.fn().mockImplementation(value => value) },
  },
  shouldValidateArray: jest.fn(),
  shouldValidateObject: jest.fn(),
}));

describe('Report repository', () => {
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

  const getRepository = (strapi: CoreStrapi) => getReportCommentRepositorySource(strapi);

  describe('when getConfig returns false', () => {
    beforeEach(() => {
      caster<jest.Mock>(getConfig).mockResolvedValue(false);
    });
    it('findPage returns not validated reports with count', async () => {
      const params = {};
      const strapi = getStrapi();
      const commentsWithCount = { results: [{ id: 1, content: 'Test comment' }], pagination: { total: 1 } };
      caster<jest.Mock>(strapi.query(UID).findPage).mockResolvedValue(commentsWithCount);

      const result = await getRepository(strapi).findPage(params);

      expect(result).toEqual(commentsWithCount);
      expect(reportResultValidator.findPage.parseAsync).not.toHaveBeenCalled();
    });

    it('findMany returns not validated reports', async () => {
      const params = {};
      const strapi = getStrapi();
      const report = [{ id: 1, content: 'Test comment' }];
      caster<jest.Mock>(strapi.query(UID).findMany).mockResolvedValue(report);

      const result = await getRepository(strapi).findMany(params);

      expect(result).toEqual(report);
      expect(reportResultValidator.findMany.parseAsync).not.toHaveBeenCalled();
    });


    it('update returns updated report', async () => {
      const params = { where: { id: 1 }, data: { content: 'Updated report' } };
      const report = { id: 1, content: 'Updated report' };
      const strapi = getStrapi();
      caster<jest.Mock>(strapi.query(UID).update).mockResolvedValue(report);

      const result = await getRepository(strapi).update(params);

      expect(result).toEqual(report);
      expect(reportResultValidator.update.parseAsync).not.toHaveBeenCalled();
    });

    it('create returns created report', async () => {
      const params = { data: { content: 'New report' }, populate: [] };
      const createdComment = { id: 1, content: 'New report' };
      const strapi = getStrapi();
      caster<jest.Mock>(strapi.query(UID).create).mockResolvedValue(createdComment);

      const result = await getRepository(strapi).create(params);

      expect(result).toEqual(createdComment);
      expect(reportResultValidator.create.parseAsync).not.toHaveBeenCalled();

    });

    it('updateMany updates multiple reports', async () => {
      const params = { data: { content: 'Updated comment' }, where: { id_in: [1, 2] } };
      const strapi = getStrapi();
      caster<jest.Mock>(strapi.query(UID).updateMany).mockResolvedValue(undefined);

      await getRepository(strapi).updateMany(params);

      expect(strapi.query(UID).updateMany).toHaveBeenCalledWith(params);
    });
  });

  describe('updateManyByIds', () => {
    it('returns the result from updateMany', async () => {
      const ids = [1, 2, 3];
      const data = { resolved: true };
      const updateResult = { count: 3 };
      const strapi = getStrapi();
      caster<jest.Mock>(strapi.query(UID).updateMany).mockResolvedValue(updateResult);

      const result = await getRepository(strapi).updateManyByIds(ids, data);

      expect(result).toEqual(updateResult);
    });

    it('passes ids and data to updateMany with a $in where clause', async () => {
      const ids = [10, 20, 30];
      const data = { resolved: true };
      const strapi = getStrapi();
      caster<jest.Mock>(strapi.query(UID).updateMany).mockResolvedValue({ count: 3 });

      await getRepository(strapi).updateManyByIds(ids, data);

      expect(strapi.query(UID).updateMany).toHaveBeenCalledWith({
        where: {
          id: { $in: ids },
        },
        data,
      });
    });

    it('propagates errors thrown by updateMany', async () => {
      const ids = [1];
      const data = { resolved: true };
      const error = new Error('updateMany failed');
      const strapi = getStrapi();
      caster<jest.Mock>(strapi.query(UID).updateMany).mockRejectedValue(error);

      await expect(getRepository(strapi).updateManyByIds(ids, data)).rejects.toThrow('updateMany failed');
    });

    it('handles an empty ids array', async () => {
      const data = { resolved: true };
      const strapi = getStrapi();
      caster<jest.Mock>(strapi.query(UID).updateMany).mockResolvedValue({ count: 0 });

      const result = await getRepository(strapi).updateManyByIds([], data);

      expect(result).toEqual({ count: 0 });
      expect(strapi.query(UID).updateMany).toHaveBeenCalledWith({
        where: {
          id: { $in: [] },
        },
        data,
      });
    });

    it('handles a single id', async () => {
      const ids = [5];
      const data = { resolved: true };
      const strapi = getStrapi();
      caster<jest.Mock>(strapi.query(UID).updateMany).mockResolvedValue({ count: 1 });

      const result = await getRepository(strapi).updateManyByIds(ids, data);

      expect(result).toEqual({ count: 1 });
      expect(strapi.query(UID).updateMany).toHaveBeenCalledWith({
        where: {
          id: { $in: [5] },
        },
        data,
      });
    });
  });
  describe('when getConfig returns true', () => {
    beforeEach(() => {
      caster<jest.Mock>(getConfig).mockResolvedValue(true);
      Object.keys(reportResultValidator).forEach(key => {
        reportResultValidator[key] = { parseAsync: jest.fn().mockImplementation(value => value) };
      });
    });

    it('findPage returns validated reports with count', async () => {
      const params = {};
      const strapi = getStrapi();
      const reports = { results: [{ id: 1, content: 'Test reports' }], pagination: { total: 1 } };
      caster<jest.Mock>(strapi.query(UID).findPage).mockResolvedValue(reports);

      const result = await getRepository(strapi).findPage(params);

      expect(result).toEqual(reports);
      expect(reportResultValidator.findPage.parseAsync).toHaveBeenCalled();
    });


    it('findMany returns validated reports', async () => {
      const params = {};
      const strapi = getStrapi();
      const comments = [{ id: 1, content: 'Test report' }];
      caster<jest.Mock>(strapi.query(UID).findMany).mockResolvedValue(comments);

      const result = await getRepository(strapi).findMany(params);

      expect(result).toEqual(comments);
      expect(reportResultValidator.findMany.parseAsync).toHaveBeenCalled();
    });

    it('update returns validated updated report', async () => {
      const params = { where: { id: 1 }, data: { content: 'Updated report' } };
      const updatedComment = { id: 1, content: 'Updated report' };
      const strapi = getStrapi();
      caster<jest.Mock>(strapi.query(UID).update).mockResolvedValue(updatedComment);

      const result = await getRepository(strapi).update(params);

      expect(result).toEqual(updatedComment);
      expect(reportResultValidator.update.parseAsync).toHaveBeenCalled();
    });



    it('create returns created comment', async () => {
      const params = { data: { content: 'New comment' }, populate: [] };
      const createdComment = { id: 1, content: 'New comment' };
      const strapi = getStrapi();
      caster<jest.Mock>(strapi.query(UID).create).mockResolvedValue(createdComment);

      const result = await getRepository(strapi).create(params);

      expect(result).toEqual(createdComment);
      expect(reportResultValidator.create.parseAsync).toHaveBeenCalled();
    });
  });
});
