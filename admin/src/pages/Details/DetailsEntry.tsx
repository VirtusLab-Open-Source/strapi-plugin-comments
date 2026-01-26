import { Box, Divider, Flex, Typography, Checkbox } from '@strapi/design-system';
import { useQueryClient } from '@tanstack/react-query';
import { capitalize, first, isEmpty, isNil, take } from 'lodash';
import { FC, useCallback } from 'react';
import { CommentDetails, Config, ContentType } from '../../api/schemas';
import { getMessage } from '../../utils';

type DetailsEntryProps = {
  readonly config: Config;
  readonly entity: CommentDetails['entity'];
  readonly filters: Record<string, unknown>;
  readonly onChangeFilters: (filters: Record<string, unknown>) => void;
  readonly schema: ContentType['data']['schema'];
};
export const DetailsEntry: FC<DetailsEntryProps> = ({ config, entity, filters, onChangeFilters, schema }) => {
  const { entryLabel = {} } = config;
  const { attributes = {} } = schema;
  const { removed = false } = filters;
  const queryClient = useQueryClient();

  const keys = Object.keys(attributes);
  const entityLabelKey = first(entryLabel[entity?.uid]);
  const FIELDS_LIMIT = 5;

  const itemKeys = take(
    keys.filter((_) => attributes[_].type === 'string' && !isNil(entity[_]) && _ !== entityLabelKey,
    ),
    FIELDS_LIMIT,
  );
  const formatLabel = (label = '') =>
    label
    .split('_')
    .map((_) => capitalize(_))
    .join(' ');

  const canEntityRender = entity && !isEmpty(entity) && (!isEmpty(itemKeys) || entity[entityLabelKey!]);


  const handleOnChange = useCallback((checked: boolean) => {
    onChangeFilters({
      ...filters,
      removed: !checked ? undefined : checked,
    });
  }, [onChangeFilters, filters]);

  return (
    <Box padding={4} background="neutral0" width="100%">
      {canEntityRender && (
        <Box marginBottom={4}>
          <Typography
            variant="sigma"
            textColor="neutral600"
            id="entity-details"
          >
            {getMessage('page.details.panel.entity', 'Details')}
          </Typography>
          <Box paddingTop={2} paddingBottom={4}>
            <Divider />
          </Box>
          <Flex direction="column" alignItems="stretch">
            <Flex direction="column" alignItems="flex-start">
              <Typography fontWeight="bold">
                {formatLabel(entityLabelKey)}
              </Typography>
              <Typography>{entity[entityLabelKey!]}</Typography>
            </Flex>
            <Flex space={4} direction="column" alignItems="stretch">
              {itemKeys.map((key) => (
                <Flex
                  key={`prop_${key}`}
                  direction="column"
                  alignItems="flex-start"
                >
                  <Typography fontWeight="bold">{formatLabel(key)}</Typography>
                  <Typography>{entity[key]}</Typography>
                </Flex>
              ))}
            </Flex>
          </Flex>
        </Box>
      )}
      <Box>
        <Typography variant="sigma" textColor="neutral600" id="view-filters">
          {getMessage("page.details.filters.label", "View")}
        </Typography>
        <Box paddingTop={2} paddingBottom={4}>
          <Divider />
        </Box>
        <Flex>
          <Checkbox
            checked={removed}
            onCheckedChange={handleOnChange}
          >
            {getMessage(
              "page.details.filters.removed.visibility",
              "Show removed comments"
            )}
          </Checkbox>
        </Flex>
      </Box>
    </Box>
  );
};