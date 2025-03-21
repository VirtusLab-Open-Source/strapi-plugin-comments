import { FC, useState } from "react"
import { getMessage } from "../../utils";
import { COMMENT_STATUS } from '../../utils/constants';
import { SingleSelect, SingleSelectOption } from '@strapi/design-system';

const getFilter = (filterName: string | undefined) => {
  if (filterName === COMMENT_STATUS.BLOCKED) {
    return {
      $or: [
        { blocked: { $eq: true } },
        { blockedThread: { $eq: true } },
      ],
    }
  }
  if (filterName === COMMENT_STATUS.REMOVED) {
    return { 
      removed: { $eq: true },
    }
  }
  if (filterName === COMMENT_STATUS.OPEN) {
    return {
      approvalStatus: { $null: true },
    }
  }
  if (filterName === undefined) {
    return {}
  }
  return {
    approvalStatus: { $eq: filterName },
  }
}

type CommentStatusFiltersProps = {
  setQueryParams: (nextParams: object, method?: "push" | "remove", replace?: boolean) => void;
};

export const CommentsStatusFilters: FC<CommentStatusFiltersProps> = ({ setQueryParams }) => {
  const [currentFilter, setCurrentFilter] = useState<string>();

  const handleChange = (filter: string | undefined) => {
    setCurrentFilter(filter)
    setQueryParams({
      page: {},
      pageSize: {},
      filters: getFilter(filter)
    });
  }

  return (
    <SingleSelect
      placeholder="Set status..."
      value={currentFilter}
      onClear={() => handleChange(undefined)}
      onChange={handleChange}
    >
      <SingleSelectOption value={COMMENT_STATUS.OPEN}>
        {getMessage(`page.common.item.status.OPEN`)}
      </SingleSelectOption>
      <SingleSelectOption value={COMMENT_STATUS.BLOCKED}>
        {getMessage(`page.common.item.status.BLOCKED`)}
      </SingleSelectOption>
      <SingleSelectOption value={COMMENT_STATUS.REMOVED}>
        {getMessage(`page.common.item.status.REMOVED`)}
      </SingleSelectOption>
      <SingleSelectOption value={COMMENT_STATUS.APPROVED}>
        {getMessage(`page.common.item.status.APPROVED`)}
      </SingleSelectOption>
      <SingleSelectOption value={COMMENT_STATUS.REJECTED}>
        {getMessage(`page.common.item.status.REJECTED`)}
      </SingleSelectOption>
      <SingleSelectOption value={COMMENT_STATUS.PENDING}>
        {getMessage(`page.common.item.status.PENDING`)}
      </SingleSelectOption>
    </SingleSelect>
  );
};