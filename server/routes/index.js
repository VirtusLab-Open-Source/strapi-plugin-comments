'use strict';

const clientRoutes = require('./client');
const adminRoutes = require('./admin');

module.exports = {
  'content-api': {
    type: 'content-api',
    routes: clientRoutes,
  },
  admin: {
    type: 'admin',
    routes: adminRoutes,
  },
};
