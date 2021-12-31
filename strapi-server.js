'use strict';

const server = require('./server');
const contentTypes = require('./content-types');

module.exports = () => ({
    ...server,
    contentTypes,
  });
