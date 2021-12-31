const PluginError = require('./../../utils/error');

module.exports = {
    parseParams: params => Object.keys(params).reduce((prev, curr) => {
        const value = params[curr];
        const parsedValue = Number(value);
        return {
         ...prev,
         [curr]: isNaN(parsedValue) ? value : parsedValue
       };
      }, {}),

  throwError: (ctx, e) => {
    if (e instanceof PluginError){
      return ctx.throw(e.status, JSON.stringify(e));
    }
    throw e;
  },
};
