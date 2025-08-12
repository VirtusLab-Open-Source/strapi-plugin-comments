import { useState } from "react";
import { getMessage } from "../../utils";
import { COMMENT_STATUS } from "../../utils/constants";
import { SingleSelect, SingleSelectOption } from "@strapi/design-system";
import { useQueryParams } from "@strapi/strapi/admin";

const COMMENT_OPTIONS = [
  COMMENT_STATUS.OPEN,
  COMMENT_STATUS.BLOCKED,
  COMMENT_STATUS.REMOVED,
  COMMENT_STATUS.APPROVED,
  COMMENT_STATUS.REJECTED,
  COMMENT_STATUS.PENDING,
];

const getFilter = (filterName: string | undefined) => {
  switch (filterName) {
    case COMMENT_STATUS.BLOCKED:
      return {
        $or: [{ blocked: { $eq: true } }, { blockedThread: { $eq: true } }],
      };
    case COMMENT_STATUS.REMOVED:
      return {
        $or: [{ blocked: { $eq: true } }, { blockedThread: { $eq: true } }],
      };
    case COMMENT_STATUS.OPEN:
      return {
        approvalStatus: { $null: true },
      };
    case undefined:
      return {};
    default:
      return {
        approvalStatus: { $eq: filterName },
      };
  }
};

export const CommentsStatusFilters = () => {
  const [_, setQueryParams] = useQueryParams();
  const [currentFilter, setCurrentFilter] = useState<string>();

  const handleChange = (filter: string | undefined) => {
    setCurrentFilter(filter);
    setQueryParams({
      page: {},
      filters: getFilter(filter),
    });
  };

  return (
    <SingleSelect
      placeholder={getMessage("page.common.item.status.setFilter")}
      value={currentFilter}
      onClear={() => handleChange(undefined)}
      onChange={handleChange}
    >
      {COMMENT_OPTIONS.map((option) => (
        <SingleSelectOption value={option}>
          {getMessage(`page.common.item.status.${option}`)}
        </SingleSelectOption>
      ))}
    </SingleSelect>
  );
};