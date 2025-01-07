import { get, isEmpty, pick, set } from 'lodash';


// @ts-ignore
const mockStrapi = (config: any = {}, toStore: boolean = false, database: any = {}) => {
  const dbConfig = toStore
    ? {
        plugin: {
          comments: {
            config: { ...config },
          },
        },
      }
    : {};

  let mock = {
    db: {
      query: (uid: string) => {
        const [handler, rest] = uid.split("::");
        const [collection] = rest.split(".");
        const values = get(mock.db, `${handler}.${collection}.records`, []);

        const parseValues = (values: any[], args: any = {}) =>
          values.map((_) => {
            const { select = [] } = args;
            if (!isEmpty(select)) {
              return pick(_, [...select, "threadOf"]);
            }
            return _;
          });

        return {
          findOne: async (args: any) =>
            new Promise((resolve) => resolve(parseValues(values, args)[0])),
          findMany: async (args: any) =>
            new Promise((resolve) => resolve(parseValues(values, args))),
          findWithCount: async () =>
            new Promise((resolve) => resolve([values, values.length])),
          count: async () => new Promise((resolve) => resolve(values.length)),
          create: async (value: any) =>
            new Promise((resolve) => resolve(value)),
          update: async (value: any) =>
            new Promise((resolve) => resolve(value)),
          delete: async (value: any) =>
            new Promise((resolve) => resolve(value)),
        };
      },
      ...dbConfig,
    },
    getRef: function () {
      return this;
    },
    plugin: function (name: string): any {
      return get(this.plugins, name);
    },
    store: async function (storeProps: { type: string; name: string }) {
      const { type, name } = storeProps; // { type: 'plugin', name: 'comments' }

      const mockedStore = {
        get: async function (props: { key: string }) {
          // { key: 'config' }
          const { key } = props;
          return new Promise((resolve) =>
            resolve(get(mock.db, `${type}.${name}.${key}`, undefined))
          );
        },
        set: async function (props: { key: string; value: any }) {
          // { key: 'config', value: {...} }
          const { key, value } = props;
          set(mock.db, `${type}.${name}.${key}`, value);
          return this.get({ key });
        },
        delete: async function (props: { key: string }) {
          // { key: 'config' }
          const { key } = props;
          set(mock.db, `${type}.${name}.${key}`, undefined);
          return new Promise((resolve) => resolve(true));
        },
      };

      return new Promise((resolve) => resolve(mockedStore));
    },
    plugins: {
      comments: {
        service: function (name: string) {
          const service = get(this.services, name);
          return service({ strapi: mock.getRef() });
        },
        package: require("../package.json"),
        services: {
          common: require("../server/src/services/common.service"),
          client: require("../server/src/services/client.service"),
          admin: require("../server/src/services/admin/admin.service"),
        },
        contentTypes: {
          comment: {
            ...require("../server/src/content-types/comments/schema"),
            uid: "plugins::comments.comment",
          },
          "comment-report": {
            ...require("../server/src/content-types/report/schema"),
            uid: "plugins::comments.comment-report",
          },
        },
      },
      email: {
        service: function (name: string) {
          const service = get(this.services, name);
          return service;
        },
        services: {
          email: {
            send: async () => { }
          }
        }
      },
      graphql: {},
      "users-permissions": {
        contentTypes: {
          user: {
            uid: 'plugin::users-permissions.user',
          }
        }
      },
    },
    config: {
      get: function (prop: string = "") {
        return get(this.plugins, prop.replace("plugin.", ""));
      },
      set: function (prop: string = "", value: any) {
        return set(this.plugins, prop.replace("plugin.", ""), value);
      },
      plugins: {
        comments: {
          approvalFlow: ["api::blog-post.blog-post"],
          entryLabel: {
            "api::blog-post.blog-post": ["alternative_subject"],
          },
          ...(toStore ? {} : config),
        },
      },
    },
    contentTypes: {
      'plugin::users-permissions.user': {
        uid: 'plugin::users-permissions.user',
        attributes: {}
      }
    }
  };

  if (!isEmpty(database)) {
    Object.keys(database).forEach((uid: string) => {
      const [handler, collection] = uid.split("::");
      set(mock.db, `${handler}.${collection}.records`, database[uid]);
    });
  }

  return mock;
};

export const resetStrapi = () => {
  Object.defineProperty(global, "strapi", {});
};

export const setupStrapi = (config = {}, toStore = false, database = {}) => {
  Object.defineProperty(global, "strapi", {
    value: mockStrapi(config, toStore, database),
    writable: true,
  });
};
