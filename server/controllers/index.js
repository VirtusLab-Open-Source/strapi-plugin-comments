'use strict';

const adminController = require('./admin');
const clientController = require('./client');

module.exports = {
  admin: adminController,
  client: clientController,
};
