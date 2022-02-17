'use strict'

module.exports = {
    flatInput(relation, query, sort, pagination) {
      const filters = query?.filters || query;
      const orOperator = (filters?.$or || []).filter(_ => !Object.keys(_).includes('removed'));
      return {
          query: {
            ...filters,
            $or: [...orOperator, { removed: { $null: true } }, { removed: false }],
            related: relation,
          },
          populate: {
            threadOf: {
              populate: { authorUser: true },
            },
          },
          pagination,
          sort,
        };
    },
  
};
