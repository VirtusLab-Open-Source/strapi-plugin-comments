import { PropType, StrapiContext } from "strapi-typed";
import { CommentsPluginConfig } from "./types";

import { isArray, isEmpty, isString } from "lodash";

import { REGEX, CONFIG_PARAMS } from "./server/utils/constants";
import server from "./server";
import contentTypes from "./content-types";
import { adminPaths } from "./server/documentation/admin";
import { clientPaths } from "./server/documentation/client";

export = () => ({
  ...server,
  contentTypes,
  config: {
    ...server.config,
    default: () => ({
      ...server.config.default,
    }),
    validator: (config: CommentsPluginConfig) => {
      // Check enabledCollections values
      const enabledCollections: PropType<
        CommentsPluginConfig,
        "enabledCollections"
      > = config[CONFIG_PARAMS.ENABLED_COLLECTIONS];
      const enabledCollectionsValid: boolean =
        enabledCollections.filter((_: string) => !REGEX.uid.test(_)).length ===
        0;

      if (!enabledCollectionsValid) {
        throw new Error(
          `'enabledCollections' must contain Content Types identifiers in the format like 'api::<collection name>.<content type name>'`
        );
      }

      // Check moderatorRoles values
      const moderatorRoles: PropType<CommentsPluginConfig, "moderatorRoles"> =
        config[CONFIG_PARAMS.MODERATOR_ROLES];
      const moderatorRolesValid: boolean =
        moderatorRoles.filter((_: string) => !isString(_)).length === 0;

      if (!moderatorRolesValid) {
        throw new Error(`'moderatorRoles' must roles keys`);
      }

      // Check approvalFlow values
      const approvalFlow: PropType<CommentsPluginConfig, "approvalFlow"> =
        config[CONFIG_PARAMS.APPROVAL_FLOW];
      const approvalFlowValid: boolean =
        approvalFlow.filter((_: string) => !REGEX.uid.test(_)).length === 0;
      if (!approvalFlowValid) {
        throw new Error(
          `'approvalFlow' must contain Content Types identifiers in the format like 'api::<collection name>.<content type name>'`
        );
      }

      // Check entryLabel keys and values
      const entryLabels: PropType<CommentsPluginConfig, "entryLabel"> =
        config[CONFIG_PARAMS.ENTRY_LABEL];
      const entryLabelKeysValid: boolean =
        Object.keys(entryLabels)
          .filter((_: string) => _ !== "*")
          .filter(
            (_: string) =>
              !(
                REGEX.uid.test(_) &&
                isArray(entryLabels[_]) &&
                !isEmpty(entryLabels[_])
              )
          ).length === 0;

      if (!entryLabelKeysValid) {
        throw new Error(
          `'entryLabel' must contain records in the format like 'api::<collection name>.<content type name>': ['Field1', 'field_2']`
        );
      }
    },
  },
  register( {strapi}: StrapiContext ) {
    const paths = {
      ...adminPaths,
      ...clientPaths
    }
    if (strapi.plugin('documentation')) {
      const override = {
        // Only run this override for version 1.0.0
        info: { version: '1.0.0' },
        paths: paths
      }

      strapi
        .plugin('documentation')
        .service('override')
        .registerOverride(override, {
          // Specify the origin in case the user does not want this plugin documented
          pluginOrigin: 'comments',
          // The override provides everything don't generate anything
          excludeFromGeneration: ['comments'],
        });
    }
  },
});
