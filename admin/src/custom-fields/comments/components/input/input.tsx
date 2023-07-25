import React, { useCallback, useEffect, useState } from "react";
// @ts-ignore
import { Stack } from "@strapi/design-system/Stack";
// @ts-ignore
import { Typography } from "@strapi/design-system/Typography";
// @ts-ignore
import { Flex } from "@strapi/design-system/Flex";
// @ts-ignore
import { Box } from "@strapi/design-system/Box";
import {
  Field,
  FieldError,
  FieldHint,
  FieldLabel,
  // @ts-ignore
} from "@strapi/design-system/Field";
// @ts-ignore
import { Option, Select } from "@strapi/design-system/Select";
// @ts-ignore
import { NumberInput } from "@strapi/design-system/NumberInput";
// @ts-ignore
import { Checkbox } from "@strapi/design-system/Checkbox";
// @ts-ignore
import { DatePicker } from "@strapi/design-system/DatePicker";
import { CustomFieldInputProps } from "strapi-typed";
// @ts-ignore
import { Grid, GridItem } from "@strapi/design-system/Grid";
import { CommentsFieldValue } from "./types";
import {
  asString,
  fromInput,
  getApprovalStatusOptions,
  getFilterByOptions,
  getRenderTypeOptions,
  getSortByDateOptions,
  handleStateSliceChange,
  handlePopulateChange,
  toOutput,
} from "./utils";
import { getMessage } from "../../../../utils";
import { useIntl } from "react-intl";
import { DEFAULTS } from "./consts";

export const CustomFieldInput: React.FC<CustomFieldInputProps> = ({
  attribute,
  description,
  disabled,
  error,
  intlLabel,
  labelAction,
  name,
  onChange,
  required,
  value,
}) => {
  const { formatMessage } = useIntl();
  const [currentState, setCurrentState] = useState(
    value ? fromInput(value) : DEFAULTS
  );

  const onCommentsNumberChange = useCallback(
    handleStateSliceChange("commentsNumber", setCurrentState),
    [setCurrentState]
  );

  const onRenderTypeChange = useCallback(
    handleStateSliceChange("renderType", setCurrentState),
    [setCurrentState]
  );

  const onSortByDateChange = useCallback(
    handleStateSliceChange("sortByDate", setCurrentState),
    [setCurrentState]
  );

  const onFilterByChange = useCallback(
    (filterBy: CommentsFieldValue["filterBy"]) => {
      setCurrentState((current) => ({
        ...current,
        filterBy,
        filterByValue: undefined,
      }));
    },
    [setCurrentState]
  );

  const onFilterByValueChange = useCallback(
    handleStateSliceChange("filterByValue", setCurrentState),
    [setCurrentState]
  );

  const onPopulateAuthorChange = useCallback(
    handlePopulateChange("author", setCurrentState),
    [setCurrentState]
  );

  const onPopulateAvatarChange = useCallback(
    handlePopulateChange("avatar", setCurrentState),
    [setCurrentState]
  );

  useEffect(() => {
    const nextValue = toOutput(currentState);
    const initialValue = value ? toOutput(fromInput(value)) : "";

    if (initialValue !== nextValue && onChange) {
      onChange({
        target: {
          name,
          value: nextValue,
          type: attribute.type,
        },
      });
    }
  }, [currentState, value]);

  return (
    <Field
      name={name}
      id={name}
      error={error}
      hint={description && getMessage(description)}
    >
      <Stack spacing={1}>
        <Flex>
          <FieldLabel required={required}>
            {formatMessage(intlLabel)}
          </FieldLabel>
          {labelAction && <Box paddingLeft={1}>{labelAction}</Box>}
        </Flex>
        <Grid gap={4}>
          <GridItem col={6}>
            <Box paddingTop={2}>
              <NumberInput
                disabled={disabled}
                label={getMessage(
                  "customField.comments.input.commentsNumber.label",
                  "Number of comments"
                )}
                name={`${name}.commentsNumber`}
                value={currentState.commentsNumber}
                onValueChange={onCommentsNumberChange}
              />
            </Box>
            <Box paddingTop={2}>
              <Select
                disabled={disabled}
                name={`${name}.renderType`}
                label={getMessage(
                  "customField.comments.input.renderType.label",
                  "Render comments as"
                )}
                value={currentState.renderType}
                onChange={onRenderTypeChange}
              >
                {getRenderTypeOptions(getMessage).map(({ value, label }) => (
                  <Option key={`renderTypeOptions-${value}`} value={value}>
                    {label}
                  </Option>
                ))}
              </Select>
            </Box>
            <Box paddingTop={2}>
              <Select
                disabled={disabled}
                name={`${name}.sortByDate`}
                label={getMessage(
                  "customField.comments.input.sortByDate.label",
                  "Sort by creation date"
                )}
                value={currentState.sortByDate}
                onChange={onSortByDateChange}
                onClear={() => onSortByDateChange(undefined)}
              >
                {getSortByDateOptions(getMessage).map(({ value, label }) => (
                  <Option key={`sortByDataOptions-${value}`} value={value}>
                    {label}
                  </Option>
                ))}
              </Select>
            </Box>
          </GridItem>
          <GridItem col={6}>
            <Box paddingTop={2}>
              <Select
                disabled={disabled}
                name={`${name}.filterBy`}
                label={getMessage(
                  "customField.comments.input.filterBy.label",
                  "Filter by"
                )}
                value={currentState.filterBy}
                onChange={onFilterByChange}
                onClear={() => onFilterByChange(undefined)}
              >
                {getFilterByOptions(getMessage).map(({ value, label }) => (
                  <Option key={`filterByOptions-${value}`} value={value}>
                    {label}
                  </Option>
                ))}
              </Select>
              <Box paddingTop={currentState.filterBy ? 2 : 0}>
                {currentState.filterBy === "APPROVAL_STATUS" ? (
                  <Select
                    label={getMessage(
                      "customField.comments.input.filterBy.option.approvalStatus.label.details.label",
                      "Specify date"
                    )}
                    disabled={disabled}
                    name={`${name}.filterBy.approvalStatus`}
                    value={currentState.filterByValue}
                    onChange={onFilterByValueChange}
                    onClear={() => onFilterByValueChange(undefined)}
                  >
                    {getApprovalStatusOptions(getMessage).map(
                      ({ value, label }) => (
                        <Option key={`approvalStatusOptions-${value}`} value={value}>
                          {label}
                        </Option>
                      )
                    )}
                  </Select>
                ) : null}
                {currentState.filterBy === "DATE_CREATED" ? (
                  <DatePicker
                    label={getMessage(
                      "customField.comments.input.filterBy.option.dateCreated.label.details.label",
                      "Specify date"
                    )}
                    disabled={disabled}
                    name={`${name}.filterBy.dateCreated`}
                    onChange={onFilterByValueChange}
                    onClear={() => onFilterByValueChange(undefined)}
                    selectedDate={currentState.filterByValue}
                    selectedDateLabel={asString}
                  />
                ) : null}
              </Box>
            </Box>
            <Box paddingTop={2}>
              <FieldLabel>
                {getMessage(
                  "customField.comments.input.populate.label",
                  "Populate"
                )}
              </FieldLabel>
              <Box paddingTop={1}>
                <Checkbox
                  disabled={disabled}
                  children={getMessage(
                    "customField.comments.input.populate.author.label",
                    "Populate author field"
                  )}
                  value={currentState.populate?.includes("author")}
                  name={`${name}.populate.author`}
                  onChange={onPopulateAuthorChange}
                />
                <Checkbox
                  disabled={disabled}
                  children={getMessage(
                    "customField.comments.input.populate.avatar.label",
                    "Populate avatar field"
                  )}
                  value={currentState.populate?.includes("avatar")}
                  name={`${name}.populate.avatar`}
                  onChange={onPopulateAvatarChange}
                />
              </Box>
            </Box>
          </GridItem>
        </Grid>
        <FieldHint />
        <FieldError />
      </Stack>
    </Field>
  );
};
