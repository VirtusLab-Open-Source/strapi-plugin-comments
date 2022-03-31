import { get, set, isEmpty } from 'lodash';

// @ts-ignore
export = (config: any = {}, toStore: boolean = false, database: any = {}) => {
  const dbConfig = toStore ? {
    plugin: {
      comments: {
        config: { ...config },
      },
    },
  }: {};

  let mock = {
    db: {
      query: (uid: string) => {
        const [handler, rest] = uid.split('::');
        const [collection] = rest.split('.');
        const values = get(mock.db, `${handler}.${collection}.records`, []);
        return {
          findOne: async () => new Promise(resolve => resolve(values[0])),
          findMany: async () => new Promise(resolve => resolve(values)),
          findWithCount: async () => new Promise(resolve => resolve([values, values.length])),
          count: async () => new Promise(resolve => resolve(values.length)),
          create: async (value: any) => new Promise(resolve => resolve(value)), 
          update: async (value: any) => new Promise(resolve => resolve(value)), 
          delete: async (value: any) => new Promise(resolve => resolve(value)),
        };
      },
      ...dbConfig,
    },
    getRef: function() {
      return this;
    },
    plugin: function(name: string): any {
      return get(this.plugins, name);
    },
    store: async function(storeProps: { type: string, name: string}) {
      const { type, name } = storeProps; // { type: 'plugin', name: 'comments' }

      const mockedStore = {
        get: async function(props: { key: string }) { // { key: 'config' }
          const { key } = props;
          return new Promise(resolve => resolve(get(mock.db, `${type}.${name}.${key}`, undefined)));
        },
        set: async function(props: { key: string, value: any }) { // { key: 'config', value: {...} }
          const { key, value } = props;
          set(mock.db, `${type}.${name}.${key}`, value);
          return this.get({ key });
        },
        delete: async function(props: { key: string }) { // { key: 'config' }
          const { key } = props;
          set(mock.db, `${type}.${name}.${key}`, undefined);
          return new Promise(resolve => resolve(true));
        },
      };

      return new Promise(resolve => resolve(mockedStore));
    },
    plugins: {
      comments: {
        service: function(name: string) {
          const service = get(this.services, name);
            return service({ strapi: mock.getRef() });
        },
        package: require('../package.json'),
        services: {
          common: require('../server/services/common'),
          client: require('../server/services/client'),
          admin: require('../server/services/admin'),
        },
        contentTypes: {
          comment: {
            ...require('../content-types/comment'),
            uid: 'plugins::comments.comment',
          },
          'comment-report': {
            ...require('../content-types/report'),
            uid: 'plugins::comments.comment-report'
          },
        }
      }
    },
    config: {
      get: function(prop: string = '') {
        return get(this.plugins, prop.replace('plugin.', ''));
      },
      set: function(prop: string = '', value: any) {
        return set(this.plugins, prop.replace('plugin.', ''), value);
      },
      plugins: {
        comments: {
          approvalFlow: ['api::blog-post.blog-post'],
          entryLabel: {
            'api::blog-post.blog-post': ['alternative_subject'],
          },
          ...(toStore ? {} : config)
        }
      }
    }
  };

  if (!isEmpty(database)) {
    Object.keys(database).forEach((uid: string) => {
      const [handler, collection] = uid.split('::');
      set(mock.db, `${handler}.${collection}.records`, database[uid]);
    });
  }

  return mock;
};