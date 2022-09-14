import { SetStateAction, Dispatch } from "react";
import { uniq } from "lodash";
import {
  getMessage,
  APPROVAL_STATUS,
  ValidationError,
  assertString,
} from "../../../../utils";
import { CommentsFieldValue, PopulateField } from "./types";

export const asString = () => "";

export const fromInput = (value: unknown) => {
  assertString(value);

  const state = JSON.parse(value);

  assertCorrectState(state);

  if (state.filterBy === "DATE_CREATED" && state.filterByValue) {
    state.filterByValue = new Date(state.filterByValue);
  }

  return state;
};

export const toOutput = (state: CommentsFieldValue) => JSON.stringify(state);

export function assertCorrectState(
  state: any
): asserts state is CommentsFieldValue {
  if (typeof state.commentsNumber !== "number") {
    throw new ValidationError("Comments number is not a number");
  }
  if (state.renderType && typeof state.renderType !== "string") {
    throw new ValidationError("Comments renderType is not a string");
  }
  if (state.sortByDate && typeof state.sortByDate !== "string") {
    throw new ValidationError("Comments sortByDate is not a string");
  }
  if (state.filterBy && typeof state.filterBy !== "string") {
    throw new ValidationError("Comments filterBy is not a string");
  }
  if (state.filterByValue && typeof state.filterByValue !== "string") {
    throw new ValidationError("Comments filterByValue is not a string");
  }
  if (state.populate && !Array.isArray(state.populate)) {
    throw new ValidationError("Comments populate is not an array");
  }
}

export const handleStateSliceChange =
  (
    key: keyof CommentsFieldValue,
    setState: Dispatch<SetStateAction<CommentsFieldValue>>
  ) =>
  (value: CommentsFieldValue[typeof key]) => {
    return setState((current) => ({
      ...current,
      [key]: value,
    }));
  };

export const handlePopulateChange =
  (
    key: PopulateField,
    setState: Dispatch<SetStateAction<CommentsFieldValue>>
  ) =>
  () => {
    return setState((current) => {
      const populate = current.populate || [];

      return {
        ...current,
        populate: populate.includes(key)
          ? populate.filter((field) => field !== key)
          : uniq(populate.concat(key)),
      };
    });
  };

export const getRenderTypeOptions = (translate: typeof getMessage) => [
  {
    value: "TREE",
    label: translate({
      id: "customField.comments.input.renderType.option.tree.label",
      defaultMessage: "Tree",
    }),
  },
  {
    value: "FLAT",
    label: translate({
      id: "customField.comments.input.renderType.option.flat.label",
      defaultMessage: "Flat list",
    }),
  },
];

export const getSortByDateOptions = (translate: typeof getMessage) => [
  {
    value: undefined,
    label: "",
  },
  {
    value: "ASC",
    label: translate({
      id: "customField.comments.input.sortByDate.option.asc.label",
      defaultMessage: "Ascending",
    }),
  },
  {
    value: "DESC",
    label: translate({
      id: "customField.comments.input.sortByDate.option.desc.label",
      defaultMessage: "Descending",
    }),
  },
];

export const getFilterByOptions = (translate: typeof getMessage) => [
  {
    value: undefined,
    label: "",
  },
  {
    value: "DATE_CREATED",
    label: translate({
      id: "customField.comments.input.filterBy.option.dateCreated.label",
      defaultMessage: "Creation date",
    }),
  },
  {
    value: "APPROVAL_STATUS",
    label: translate({
      id: "customField.comments.input.filterBy.option.approvalStatus.label",
      defaultMessage: "Approval Status",
    }),
  },
];

export const getApprovalStatusOptions = (translate: typeof getMessage) => [
  {
    value: undefined,
    label: "",
  },
  {
    value: APPROVAL_STATUS.APPROVED,
    label: translate({
      id: "customField.comments.input.filterBy.option.approvalStatus.option.approved.label",
      defaultMessage: "Approved",
    }),
  },
  {
    value: APPROVAL_STATUS.PENDING,
    label: translate({
      id: "customField.comments.input.filterBy.option.approvalStatus.option.pending.label",
      defaultMessage: "Pending",
    }),
  },
  {
    value: APPROVAL_STATUS.REJECTED,
    label: translate({
      id: "customField.comments.input.filterBy.option.approvalStatus.option.rejected.label",
      defaultMessage: "Rejected",
    }),
  },
];
