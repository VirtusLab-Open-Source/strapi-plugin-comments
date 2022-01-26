'use strict';

const adminServices = require('./admin');
const clientServices = require('./client');
const commonServices = require('./common');
const graphQLService = require('./graphql');

module.exports = {
  admin: adminServices,
  client: clientServices,
  common: commonServices,
  gql: graphQLService,
};
