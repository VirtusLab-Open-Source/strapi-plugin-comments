import { IServiceCommon } from '../../../types';
import { Comment } from '../../../types/contentTypes';
import { CONFIG_PARAMS } from '../../utils/constants';
import PluginError from '../../utils/error';
import { getPluginService } from '../../utils/functions';

jest.mock


const setup = (config = {}, toStore = false, database = {}) => {
  Object.defineProperty(global, 'strapi', {
    value: require('../../../__mocks__/initSetup')(config, toStore, database),
    writable: true,
  });
}

afterEach(() => {
  Object.defineProperty(global, 'strapi', {});
})

describe('Test Comments service functions utils', () => {
  describe('Get plugin store', () => {
    beforeEach(() => setup());

    test('Should return store', async () => {
      const pluginStore = await getPluginService<IServiceCommon>('common').getPluginStore();
      expect(pluginStore).toHaveProperty('get');
      expect(pluginStore).toHaveProperty('set');
      expect(pluginStore).toHaveProperty('delete');
    });
  });

  describe('Get plugin config', () => {
    describe('Local config', () => {
      beforeEach(() => setup({
        test: 'sample',
      }));
  
      test('Should return config value', async () => {
        const result = await getPluginService<IServiceCommon>('common').getConfig('test');
        expect(result).toEqual('sample');
      });
  
      test('Should return default config prop value if not set', async () => {
        const result = await getPluginService<IServiceCommon>('common').getConfig('another', 'defaultValue');
        expect(result).toEqual('defaultValue');
      });
    });

    describe('Store config', () => {
      beforeEach(() => setup({
        test: 'sample',
      }, true));
  
      test('Should return config value', async () => {
        const result = await getPluginService<IServiceCommon>('common').getConfig('test');
        expect(result).toEqual('sample');
      });
  
      test('Should return default config prop value if not set', async () => {
        const result = await getPluginService<IServiceCommon>('common').getConfig('another', 'defaultValue');
        expect(result).toEqual('defaultValue');
      });
    });
  });

  describe('Validate user context', () => {
    beforeEach(() => setup());

    test('Should context be valid', () => {
      expect(getPluginService<IServiceCommon>('common').isValidUserContext({ id: 1 })).toEqual(true);
    });

    test('Should context be invalid', () => {
      expect(getPluginService<IServiceCommon>('common').isValidUserContext({ })).toEqual(false);
    });

    test('Should use fallback', () => {
      expect(getPluginService<IServiceCommon>('common').isValidUserContext()).toEqual(true);
    });
  });

  describe('Sanitize comments entity', () => {
    beforeEach(() => setup());

    const sample = {
      id: 1,
      content: 'Test text',
      blocked: false,
      removed: true,
    };

    const authorSample = {
      id: 1,
      username: 'Joe Doe',
      email: 'test@example.com',
      password: 'xxx',
    };

    const authorGenericSample = {
      authorId: 1,
      authorName: 'Joe Doe',
      authorEmail: 'test@example.com',
    };

    const outputAuthorSample = {
      id: 1,
      name: 'Joe Doe',
      email: 'test@example.com',
    };

    test('Should return exact the same value', () => {
      const input = { ...sample };
      const output = getPluginService<IServiceCommon>('common').sanitizeCommentEntity(input);
      expect(output).toHaveProperty('id', input.id);
      expect(output).toHaveProperty('content', input.content);
      expect(output).toHaveProperty('blocked', input.blocked);
      expect(output).toHaveProperty('removed', input.removed);
    });

    test('Should return entity with \'author\' property for generic author', () => {
      const input = {
        ...sample,
        ...authorGenericSample,
      };
      const output = getPluginService<IServiceCommon>('common').sanitizeCommentEntity(input);

      expect(output).toHaveProperty('author');
      expect(output).toHaveProperty('author.id', input.authorId);
      expect(output).toHaveProperty('author.id', outputAuthorSample.id);
      expect(output).toHaveProperty('author.name', input.authorName);
      expect(output).toHaveProperty('author.name', outputAuthorSample.name);
      expect(output).toHaveProperty('author.email', input.authorEmail);
      expect(output).toHaveProperty('author.email', outputAuthorSample.email);

      expect(output).not.toHaveProperty('authorId');
      expect(output).not.toHaveProperty('authorName');
      expect(output).not.toHaveProperty('authorEmail');
    });

    test('Should return entity with \'author\' property for Strapi author', () => {
      const input = {
        ...sample,
        authorUser: authorSample,
      };
      const output = getPluginService<IServiceCommon>('common').sanitizeCommentEntity(input);

      expect(output).toHaveProperty('author');
      expect(output).toHaveProperty('author.id', input.authorUser.id);
      expect(output).toHaveProperty('author.id', outputAuthorSample.id);
      expect(output).toHaveProperty('author.name', input.authorUser.username);
      expect(output).toHaveProperty('author.name', outputAuthorSample.name);
      expect(output).toHaveProperty('author.email', input.authorUser.email);
      expect(output).toHaveProperty('author.email', outputAuthorSample.email);

      expect(output).not.toHaveProperty('authorUser');

      expect(output).not.toHaveProperty('author.password');
    });
  });

  describe('Bad Words filtering', () => {
    beforeEach(() => setup());

    const text = 'Lorem ipsum dolor sit fuck amet';

    test('Should find bad words usage and throw error PluginError', async () => {
      expect.assertions(7);
      try {
        await getPluginService<IServiceCommon>('common').checkBadWords(text);
      } catch (e) {
        expect(await getPluginService<IServiceCommon>('common').getConfig('badWords')).toEqual(undefined);
        expect(e).toBeInstanceOf(PluginError);
        expect(e).toHaveProperty('status', 400);
        expect(e).toHaveProperty('name', 'Strapi:Plugin:Comments');
        expect(e).toHaveProperty('message', 'Bad language used! Please polite your comment...');
        expect(e).toHaveProperty('payload');

        // @ts-ignore
        expect(e?.payload).toEqual(expect.objectContaining({
          content: {
            original: text,
            filtered: text.replace('fuck', '****'),
          }
        }));
      }
    });
  });

  describe('Bad Words filtering', () => {
    beforeEach(() => setup({ badWords: false }));

    const text = 'Lorem ipsum dolor sit fuck amet';

    test('Should skip bad words filtering because of configuration change', async () => {
      expect(await getPluginService<IServiceCommon>('common').getConfig('badWords')).toEqual(false);
      expect(await getPluginService<IServiceCommon>('common').checkBadWords(text)).toEqual(text);
    });
  });

  describe('Parse relation string (store config)', () => {
    const [uid, id] = ['api::my-collection.my-content-type', '1'];
    const validCollection = `${uid}:${id}`;

    const [wrongUid, wrongId] = ['api::wrong.type', '2'];
    const testCollection = `${wrongUid}:${wrongId}`;

    describe('Store config', () => {
      beforeEach(() => setup({ enabledCollections: [uid] }, true));

      test('Should pass', async () => {
        expect(await getPluginService<IServiceCommon>('common').parseRelationString(validCollection));
        expect(await getPluginService<IServiceCommon>('common').getConfig(CONFIG_PARAMS.ENABLED_COLLECTIONS)).toContain(uid);
      });
  
      test('Should fail with 403', async () => {
  
        try {
          await getPluginService<IServiceCommon>('common').parseRelationString(testCollection);
        } catch(e) {
          expect(await getPluginService<IServiceCommon>('common').getConfig(CONFIG_PARAMS.ENABLED_COLLECTIONS)).toContain(uid);
          expect(await getPluginService<IServiceCommon>('common').getConfig(CONFIG_PARAMS.ENABLED_COLLECTIONS)).not.toContain(wrongUid);
          expect(e).toBeInstanceOf(PluginError);
          expect(e).toHaveProperty('status', 403);
        }
      });
    });

    describe('Local config', () => {
      beforeEach(() => setup({ enabledCollections: [uid] }));

      test('Should pass', async () => {
        expect(await getPluginService<IServiceCommon>('common').parseRelationString(validCollection));
        expect(await getPluginService<IServiceCommon>('common').getConfig(CONFIG_PARAMS.ENABLED_COLLECTIONS)).toContain(uid);
      });
  
      test('Should fail with 403', async () => {
  
        try {
          await getPluginService<IServiceCommon>('common').parseRelationString(testCollection);
        } catch(e) {
          expect(await getPluginService<IServiceCommon>('common').getConfig(CONFIG_PARAMS.ENABLED_COLLECTIONS)).toContain(uid);
          expect(await getPluginService<IServiceCommon>('common').getConfig(CONFIG_PARAMS.ENABLED_COLLECTIONS)).not.toContain(wrongUid);
          expect(e).toBeInstanceOf(PluginError);
          expect(e).toHaveProperty('status', 403);
        }
      });
    });

    describe('Merge related entity', () => {
      beforeEach(() => setup({ enabledCollections: [uid] }));
      const collection = 'api::collection.test';
      const related = `${collection}:1`;
      const comment = {
        id: 1,
        content: 'ABC',
        threadOf: null,
        related,
        authorId: 1,
        authorName: 'Joe Doe',
        authorEmail: 'joe@example.com'
      };
      const relatedEntity = { id: 1, title: 'Test', uid: collection};

      
      test('Should merge related entity', async () => {
        const result = await getPluginService<IServiceCommon>('common').mergeRelatedEntityTo(comment, [relatedEntity]);
        expect(result).toHaveProperty('id', 1);
        expect(result).not.toHaveProperty('related', related);
        expect(result).toHaveProperty(['related', 'title'], relatedEntity.title);
      });
    });

    describe('Client API', () => {
      const collection = 'api::collection.test';
      const related = `${collection}:1`;
      const db: Array<Comment> = [{
        id: 1,
        content: 'ABC',
        threadOf: null,
        related,
        authorId: 1,
        authorName: 'Joe Doe',
        authorEmail: 'joe@example.com'
      }, {
        id: 2,
        content: 'DEF',
        threadOf: 1,
        related,
        authorId: 1,
        authorName: 'Joe Doe',
        authorEmail: 'joe@example.com',
        blockedThread: true,
      }, {
        id: 3,
        content: 'GHJ',
        threadOf: null,
        related,
        authorId: 1,
        authorName: 'Joe Doe',
        authorEmail: 'joe@example.com'
      }, {
        id: 4,
        content: 'IKL',
        threadOf: 2,
        related,
        authorId: 1,
        authorName: 'Joe Doe',
        authorEmail: 'joe@example.com',
      }];
      const relatedEntity = { id: 1, title: 'Test', uid: collection};

      beforeEach(() => setup({ enabledCollections: [collection] }, true, {
        'plugins::comments': db,
        'api::collection': [relatedEntity, { id: 2, title: 'Test 2', uid: collection }],
      }));

      describe('findAllFlat', () => {
        test('Should return proper structure', async () => {
          const result = await getPluginService<IServiceCommon>('common').findAllFlat({ query: { related }}, relatedEntity);
          expect(result).toHaveProperty('data');
          expect(result).not.toHaveProperty('meta');
          expect(result.data.length).toBe(4);
          expect(result).toHaveProperty(['data', 0, 'content'], db[0].content);
          expect(result).toHaveProperty(['data', 3, 'content'], db[3].content);
        });
  
        test('Should return structure with pagination', async () => {
          const result = await getPluginService<IServiceCommon>('common').findAllFlat({ query: { related }, pagination: { page: 1, pageSize: 5 }}, relatedEntity);
          expect(result).toHaveProperty('data');
          expect(result).toHaveProperty('meta');
          expect(result.data.length).toBe(4);
          expect(result).toHaveProperty(['data', 0, 'content'], db[0].content);
          expect(result).toHaveProperty(['data', 0, 'author']);
          expect(result).toHaveProperty(['data', 0, 'author', 'id'], db[0].authorId);
          expect(result).toHaveProperty(['data', 0, 'author', 'name'], db[0].authorName);
          expect(result).toHaveProperty(['data', 0, 'author', 'email'], db[0].authorEmail);
          expect(result).toHaveProperty(['data', 3, 'content'], db[3].content);
          expect(result).toHaveProperty(['meta', 'pagination', 'page'], 1);
          expect(result).toHaveProperty(['meta', 'pagination', 'pageSize'], 5);
        });
      });

      describe('findAllInHierarchy', () => {
        test('Should return nested structure starting for root', async () => {
          const result = await getPluginService<IServiceCommon>('common').findAllInHierarchy({ query: { related }}, relatedEntity);
          expect(result).not.toHaveProperty('data');
          expect(result).not.toHaveProperty('meta');
          expect(result.length).toBe(2);
          expect(result).toHaveProperty([0, 'content'], db[0].content);
          expect(result).toHaveProperty([0, 'children']);
          expect(result[0]?.children?.length).toBe(1);
          expect(result).toHaveProperty([0, 'children', 0, 'content'], 'DEF');
          expect(result).toHaveProperty([0, 'children', 0, 'children']);
          
          // @ts-ignore
          expect(result[0]?.children[0]?.children?.length).toBe(1);
          expect(result).toHaveProperty([0, 'children', 0, 'children', 0, 'content'], 'IKL');
          expect(result).toHaveProperty([1, 'content'], db[2].content);
        });

        test('Should return nested structure starting for comment id: 1', async () => {
          const result = await getPluginService<IServiceCommon>('common').findAllInHierarchy({ query: { related }, startingFromId: 1}, relatedEntity);
          expect(result).not.toHaveProperty('data');
          expect(result).not.toHaveProperty('meta');
          expect(result.length).toBe(1);
          expect(result).toHaveProperty([0, 'content'], db[1].content);
          expect(result).toHaveProperty([0, 'children']);
          expect(result[0]?.children?.length).toBe(1);
          expect(result).toHaveProperty([0, 'children', 0, 'content'], 'IKL');
        });

        test('Should return nested structure starting for comment id: 1 without blocked comments', async () => {
          const result = await getPluginService<IServiceCommon>('common').findAllInHierarchy({ query: { related }, startingFromId: 1, dropBlockedThreads: true}, relatedEntity);
          expect(result).not.toHaveProperty('data');
          expect(result).not.toHaveProperty('meta');
          expect(result.length).toBe(1);
          expect(result).toHaveProperty([0, 'content'], db[1].content);
          expect(result).toHaveProperty([0, 'children']);
          expect(result[0]?.children?.length).toBe(0);
        });
      });

      describe('findOne', () => {
        test('Should return proper structure', async () => {
          const result = await getPluginService<IServiceCommon>('common').findOne({ related });
          expect(result).toHaveProperty('id', db[0].id);
          expect(result).toHaveProperty('content', db[0].content);
          expect(result).toHaveProperty(['author', 'id'], db[0].authorId);
          expect(result).toHaveProperty(['author', 'name'], db[0].authorName);
          expect(result).toHaveProperty(['author', 'email'], db[0].authorEmail);
        });
      });

      describe('findRelatedEntitiesFor', () => {
        test('Should return proper structure', async () => {
          const result = await getPluginService<IServiceCommon>('common').findRelatedEntitiesFor(db);
          expect(result).toHaveProperty([0, 'id'], relatedEntity.id);
          expect(result).toHaveProperty([0, 'title'], relatedEntity.title);
          expect(result).toHaveProperty([0, 'uid'], relatedEntity.uid);
        });
      });
    });
  });
});
