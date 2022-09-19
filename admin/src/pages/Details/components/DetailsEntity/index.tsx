/**
 *
 * Entity Details
 *
 */

// TODO
// @ts-nocheck
import React from "react";
import PropTypes from "prop-types";
import { capitalize, isNil, isEmpty, first, take } from "lodash";
import { Box } from "@strapi/design-system/Box";
import { Divider } from "@strapi/design-system/Divider";
import { Flex } from "@strapi/design-system/Flex";
import { Stack } from "@strapi/design-system/Stack";
import { Typography } from "@strapi/design-system/Typography";
import { getMessage } from "../../../../utils";
import DetailsFilters from "../DetailsFilters";

const DetailsEntity = ({
  data = {},
  schema = {},
  config = {},
  filters,
  onFiltersChange,
}) => {
  const { entryLabel = {} } = config;
  const { attributes = {} } = schema;
  const keys = Object.keys(attributes);
  const entityLabelKey = first(entryLabel[data?.uid]);

  const FIELDS_LIMIT = 5;
  const itemKeys = take(
    keys.filter(
      (_) =>
        attributes[_].type === "string" &&
        !isNil(data[_]) &&
        _ !== entityLabelKey
    ),
    FIELDS_LIMIT
  );

  const formatLabel = (label = "") =>
    label
      .split("_")
      .map((_) => capitalize(_))
      .join(" ");

  const entityIsRenderable =
    data && !isEmpty(data) && (!isEmpty(itemKeys) || data[entityLabelKey]);

  return (
    <Box padding={4}>
      {entityIsRenderable && (
        <Box marginBottom={4}>
          <Typography
            variant="sigma"
            textColor="neutral600"
            id="entity-details"
          >
            {getMessage("page.details.panel.entity", "Details")}
          </Typography>
          <Box paddingTop={2} paddingBottom={4}>
            <Divider />
          </Box>
          <Stack size={itemKeys.length}>
            <Flex direction="column" alignItems="flex-start">
              <Typography fontWeight="bold">
                {formatLabel(entityLabelKey)}
              </Typography>
              <Typography>{data[entityLabelKey]}</Typography>
            </Flex>
            {itemKeys.map((_) => (
              <Flex
                key={`prop_${_}`}
                direction="column"
                alignItems="flex-start"
              >
                <Typography fontWeight="bold">{formatLabel(_)}</Typography>
                <Typography>{data[_]}</Typography>
              </Flex>
            ))}
          </Stack>
        </Box>
      )}
      <Box>
        <Typography variant="sigma" textColor="neutral600" id="view-filters">
          {getMessage("page.details.filters.label", "View")}
        </Typography>
        <Box paddingTop={2} paddingBottom={4}>
          <Divider />
        </Box>
        <DetailsFilters data={filters} onChange={onFiltersChange} />
      </Box>
    </Box>
  );
};

DetailsEntity.propTypes = {
  data: PropTypes.object.isRequired,
  schema: PropTypes.object.isRequired,
  config: PropTypes.object.isRequired,
  filters: PropTypes.object.isRequired,
  onFiltersChange: PropTypes.func.isRequired,
};

export default DetailsEntity;
