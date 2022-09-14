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

const DEFAULTS: CommentsFieldValue = {
  commentsNumber: 30,
  populate: [],
  renderType: "FLAT",
};

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
  const [currentValue, setCurrentValue] = useState(
    value ? fromInput(value) : DEFAULTS
  );

  const onCommentsNumberChange = useCallback(
    handleStateSliceChange("commentsNumber", setCurrentValue),
    [setCurrentValue]
  );

  const onRenderTypeChange = useCallback(
    handleStateSliceChange("renderType", setCurrentValue),
    [setCurrentValue]
  );

  const onSortByDateChange = useCallback(
    handleStateSliceChange("sortByDate", setCurrentValue),
    [setCurrentValue]
  );

  const onFilterByChange = useCallback(
    (filterBy: CommentsFieldValue["filterBy"]) => {
      setCurrentValue((current) => ({
        ...current,
        filterBy,
        filterByValue: undefined,
      }));
    },
    [setCurrentValue]
  );

  const onFilterByValueChange = useCallback(
    handleStateSliceChange("filterByValue", setCurrentValue),
    [setCurrentValue]
  );

  const onPopulateAuthorChange = useCallback(
    handlePopulateChange("author", setCurrentValue),
    [setCurrentValue]
  );

  const onPopulateAvatarChange = useCallback(
    handlePopulateChange("avatar", setCurrentValue),
    [setCurrentValue]
  );

  useEffect(() => {
    const newValue = toOutput(currentValue);

    if (value && toOutput(fromInput(value)) !== newValue) {
      onChange?.({
        target: {
          name,
          value: newValue,
          type: attribute.type,
        },
      });
    }
  }, [currentValue, value]);

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
                label={getMessage({
                  id: "customField.comments.input.commentsNumber.label",
                  defaultMessage: "Number of comments",
                })}
                name={`${name}.commentsNumber`}
                value={currentValue.commentsNumber}
                onValueChange={onCommentsNumberChange}
              />
            </Box>
            <Box paddingTop={2}>
              <Select
                disabled={disabled}
                name={`${name}.renderType`}
                label={getMessage({
                  id: "customField.comments.input.renderType.label",
                  defaultMessage: "Render comments as",
                })}
                value={currentValue.renderType}
                onChange={onRenderTypeChange}
              >
                {getRenderTypeOptions(getMessage).map(({ value, label }) => (
                  <Option key={value} value={value}>
                    {label}
                  </Option>
                ))}
              </Select>
            </Box>
            <Box paddingTop={2}>
              <Select
                disabled={disabled}
                name={`${name}.sortByDate`}
                label={getMessage({
                  id: "customField.comments.input.sortByDate.label",
                  defaultMessage: "Sort by creation date",
                })}
                value={currentValue.sortByDate}
                onChange={onSortByDateChange}
              >
                {getSortByDateOptions(getMessage).map(({ value, label }) => (
                  <Option key={value} value={value}>
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
                label={getMessage({
                  id: "customField.comments.input.filterBy.label",
                  defaultMessage: "Filter by",
                })}
                value={currentValue.filterBy}
                onChange={onFilterByChange}
              >
                {getFilterByOptions(getMessage).map(({ value, label }) => (
                  <Option key={value} value={value}>
                    {label}
                  </Option>
                ))}
              </Select>
              <Box paddingTop={2}>
                {currentValue.filterBy === "APPROVAL_STATUS" ? (
                  <Select
                    label={getMessage({
                      id: "customField.comments.input.filterBy.option.approvalStatus.label.details.label",
                      defaultMessage: "Specify date",
                    })}
                    disabled={disabled}
                    name={`${name}.filterBy.approvalStatus`}
                    value={currentValue.filterByValue}
                    onChange={onFilterByValueChange}
                  >
                    {getApprovalStatusOptions(getMessage).map(
                      ({ value, label }) => (
                        <Option key={value} value={value}>
                          {label}
                        </Option>
                      )
                    )}
                  </Select>
                ) : null}
                {currentValue.filterBy === "DATE_CREATED" ? (
                  <DatePicker
                    label={getMessage({
                      id: "customField.comments.input.filterBy.option.dateCreated.label.details.label",
                      defaultMessage: "Specify date",
                    })}
                    disabled={disabled}
                    name={`${name}.filterBy.dateCreated`}
                    onChange={onFilterByValueChange}
                    selectedDate={currentValue.filterByValue}
                    selectedDateLabel={asString}
                  />
                ) : null}
              </Box>
            </Box>
            <Box paddingTop={4}>
              <Checkbox
                disabled={disabled}
                children={getMessage({
                  id: "customField.comments.input.populate.author.label",
                  defaultMessage: "Populate author field",
                })}
                value={currentValue.populate?.includes("author")}
                name={`${name}.populate.author`}
                onChange={onPopulateAuthorChange}
              />
              <Checkbox
                disabled={disabled}
                children={getMessage({
                  id: "customField.comments.input.populate.avatar.label",
                  defaultMessage: "Populate avatar field",
                })}
                value={currentValue.populate?.includes("avatar")}
                name={`${name}.populate.avatar`}
                onChange={onPopulateAvatarChange}
              />
            </Box>
          </GridItem>
        </Grid>
        <FieldHint />
        <FieldError />
      </Stack>
    </Field>
  );
};
