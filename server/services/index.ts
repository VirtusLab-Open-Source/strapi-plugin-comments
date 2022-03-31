'use strict';

import adminServices from './admin';
import clientServices from './client';
import commonServices from './common';
import graphQLService from './graphql';

export = {
  admin: adminServices,
  client: clientServices,
  common: commonServices,
  gql: graphQLService,
};
