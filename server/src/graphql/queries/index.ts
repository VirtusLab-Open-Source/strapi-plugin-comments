import { CoreStrapi } from '../../@types';
import { Nexus } from '../../@types/graphql';
import findAllFlat from './findAllFlat';
import findAllInHierarchy from './findAllInHierarchy';
import findAllPerAuthor from './findAllPerAuthor';

export const getQueries = (strapi: CoreStrapi, nexus: Nexus) => {
  const queries = {
    findAllFlat,
    findAllInHierarchy,
    findAllPerAuthor,
  };

  return nexus.extendType({
    type: 'Query',
    definition(t) {
      for (const [name, configFactory] of Object.entries(queries)) {
        const config = configFactory(strapi, nexus);

        t.field(name, config);
      }
    },
  });
};
