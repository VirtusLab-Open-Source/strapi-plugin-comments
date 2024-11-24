import { CoreStrapi } from '../../@types-v5';
import { Nexus } from '../../@types-v5/graphql';
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
