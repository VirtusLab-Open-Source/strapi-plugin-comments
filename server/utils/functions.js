'use strict'

module.exports = {
    getPluginService(name) {
        return strapi
          .plugin('comments')
          .service(name);
      },

    parseParams: params => 
        Object.keys(params).reduce((prev, curr) => {
            const value = params[curr];
            const parsedValue = Number(value);
            return {
                ...prev,
                [curr]: isNaN(parsedValue) ? value : parsedValue
            };
        }, {}),
};
