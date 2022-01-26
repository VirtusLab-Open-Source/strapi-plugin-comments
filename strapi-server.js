'use strict';

const { isArray, isEmpty, isString } = require('lodash');

const server = require('./server');
const contentTypes = require('./content-types');
const { REGEX } = require('./server/utils/constants');

module.exports = () => ({
    ...server,
    contentTypes,
    config: {
      ...server.config,
      default: ({ env }) => ({
        ...server.config.default,
      }),
      validator: (config) => { 
        // Check moderatorRoles values
        const moderatorRolesValid = config.moderatorRoles
          .filter(_ => !isString(_)).length === 0;
        if (!moderatorRolesValid) {
          throw new Error(`'moderatorRoles' must roles keys`);
        }

        // Check approvalFlow values
        const approvalFlowValid = config.approvalFlow
          .filter(_ => !REGEX.uid.test(_)).length === 0;
        if (!approvalFlowValid) {
          throw new Error(`'approvalFlow' must contain Content Types identifiers in the format like 'api::<collection name>.<content type name>'`);
        }

        // Check entryLabel keys and values
        const entryLabelKeysValid = Object.keys(config.entryLabel)
          .filter(_ => _ !== '*')
          .filter(_ => !(REGEX.uid.test(_) && isArray(config.entryLabel[_]) && !isEmpty(config.entryLabel[_]))).length === 0;

        if (!entryLabelKeysValid) {
          throw new Error(`'entryLabel' must contain records in the format like 'api::<collection name>.<content type name>': ['Field1', 'field_2']`);
        }
      },
    },
  });
