const PluginError = require('../../services/utils/error');

module.exports = {
    parseParams: params => Object.keys(params).reduce((prev, curr) => {
        const value = params[curr];
        const parsedValue = isNaN(value) ? value : parseInt(value, 10);
        return {
         ...prev,
         [curr]: parsedValue,
       };
      }, {}),

  throwError: (ctx, e) => {
    if (e instanceof PluginError){
      return ctx.throw(e.status, JSON.stringify(e));
    }
    throw e;
  },
};
