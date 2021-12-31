'use strict';

const adminServices = require('./admin');
const clientServices = require('./client');
const commonServices = require('./common');

module.exports = {
  admin: adminServices,
  client: clientServices,
  common: commonServices,
};
