'use strict'

module.exports = {
    flatInput(relation, query) {
        return {
            query: {
              ...query,
              $or: [{ removed: { $null: true } }, { removed: false }],
              related: relation,
            },
            populate: {
              threadOf: {
                populate: { authorUser: true },
              },
            },
          };
    },
  
};
