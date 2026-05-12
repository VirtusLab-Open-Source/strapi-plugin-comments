import { FC } from "react";
import { Th, Typography } from "@strapi/design-system";
import { ChevronDown, ChevronUp } from "@strapi/icons";
import { useQueryParams } from "@strapi/strapi/admin";
import { ThProps } from "@strapi/design-system/dist/components/Table/Cell";
import { getMessage } from '../../utils';

type SortQueryParams = {
  orderBy?: string;
  page?: object;
  pageSize?: object;
};

const getChangedOrder = (orderByKey: string, order: string | undefined) => {
  switch (order) {
    case "asc":
    case "ASC":
      return `${orderByKey}:desc`;
    case "desc":
    case "DESC":
    default:
      return `${orderByKey}:asc`;
  }
};

type SortableThProps = {
  label: string;
  orderByKey?: string;
} & Omit<ThProps, 'children'>;

export const SortableTh: FC<SortableThProps> = ({ label, orderByKey, ...rest }) => {
  const [{ query: queryParams }, setQueryParams] =
    useQueryParams<SortQueryParams>();

  const labelText = getMessage(label);

  if(!orderByKey) {
    return (
      <Th {...rest}>
        <Typography variant="sigma" style={{ marginRight: "8px" }}>
          {labelText}
        </Typography>
      </Th>
    );
  }

  const { orderBy = ":" } = queryParams;
  const key = orderBy.split(":")[0];
  const order = orderBy.split(":").pop()?.toLowerCase();

  const handleSort = () => {
    setQueryParams({
      page: {},
      orderBy: getChangedOrder(orderByKey, order),
    });
  };

  return (
    <Th onClick={handleSort} style={{ cursor: "pointer" }} {...rest}>
      <Typography variant="sigma" style={{ marginRight: "8px" }}>
        {labelText}
      </Typography>
      {`${key}:${order}` === `${orderByKey}:asc` && (
        <ChevronDown />
      )}
      {`${key}:${order}` === `${orderByKey}:desc` && (
        <ChevronUp />
      )}
    </Th>
  );
};
