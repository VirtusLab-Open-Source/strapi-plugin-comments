import { PropType } from "strapi-typed";
import { CommentsPluginConfig } from "./types";

import { isArray, isEmpty, isString } from "lodash";

import { REGEX, CONFIG_PARAMS } from "./server/utils/constants";
import server from "./server";
import contentTypes from "./content-types";

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
      const enabledCollections: PropType<CommentsPluginConfig,"enabledCollections"> = 
        config[CONFIG_PARAMS.ENABLED_COLLECTIONS] as CommentsPluginConfig["enabledCollections"];
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
        config[CONFIG_PARAMS.MODERATOR_ROLES] as CommentsPluginConfig['moderatorRoles'];
      const moderatorRolesValid: boolean =
        moderatorRoles.filter((_: string) => !isString(_)).length === 0;

      if (!moderatorRolesValid) {
        throw new Error(`'moderatorRoles' must roles keys`);
      }

      // Check approvalFlow values
      const approvalFlow: PropType<CommentsPluginConfig, "approvalFlow"> =
        config[CONFIG_PARAMS.APPROVAL_FLOW] as CommentsPluginConfig['approvalFlow'];
      const approvalFlowValid: boolean =
        approvalFlow.filter((_: string) => !REGEX.uid.test(_)).length === 0;
      if (!approvalFlowValid) {
        throw new Error(
          `'approvalFlow' must contain Content Types identifiers in the format like 'api::<collection name>.<content type name>'`
        );
      }

      // Check entryLabel keys and values
      const entryLabels: PropType<CommentsPluginConfig, "entryLabel"> = 
        config[CONFIG_PARAMS.ENTRY_LABEL] as CommentsPluginConfig['entryLabel'];
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
});
