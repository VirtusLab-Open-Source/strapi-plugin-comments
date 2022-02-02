const { get, set } = require('lodash');

module.exports = (config = {}) => {
  const mock = {
    getRef: function() {
      return this;
    },
    plugin: function(name) {
      return this.plugins[name];
    },
    plugins: {
      comments: {
        service: function(name) {
            return this.services[name]({ strapi: mock.getRef() });
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
      get: function(prop = '') {
        return get(this.plugins, prop.replace('plugin.', ''));
      },
      set: function(prop = '', value) {
        return set(this.plugins, prop.replace('plugin.', ''), value);
      },
      plugins: {
        comments: {
          approvalFlow: ['api::blog-post.blog-post'],
          entryLabel: {
            'api::blog-post.blog-post': ['alternative_subject'],
          },
          ...config
        }
      }
    }
  };
  return mock;
};