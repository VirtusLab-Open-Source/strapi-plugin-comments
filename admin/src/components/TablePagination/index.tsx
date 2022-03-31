// @ts-nocheck

import React from "react";
import PropTypes from "prop-types";
import { Box } from "@strapi/design-system/Box";
import { Flex } from "@strapi/design-system/Flex";
import { PaginationURLQuery, PageSizeURLQuery } from "@strapi/helper-plugin";

const TablePagination = ({ pagination }) => {
  return (
    <Box paddingTop={4}>
      <Flex alignItems="flex-end" justifyContent="space-between">
        <PageSizeURLQuery trackedEvent="willChangeNumberOfEntriesPerPage" />
        <PaginationURLQuery pagination={pagination} />
      </Flex>
    </Box>
  );
};

TablePagination.defaultProps = {
  pagination: {
    pageCount: 0,
    pageSize: 10,
    total: 0,
  },
};

TablePagination.propTypes = {
  pagination: PropTypes.shape({
    page: PropTypes.number,
    pageCount: PropTypes.number,
    pageSize: PropTypes.number,
    total: PropTypes.number,
  }),
};

export default TablePagination;
