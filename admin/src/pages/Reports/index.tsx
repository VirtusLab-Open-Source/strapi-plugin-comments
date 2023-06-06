/*
 *
 * Report
 *
 */

// TODO
// @ts-nocheck

import {
  ActionLayout,
  ContentLayout,
  HeaderLayout,
  Layout,
} from "@strapi/design-system/Layout";
import {
  EmptyStateLayout,
  LoadingIndicatorPage,
  SearchURLQuery,
  useFocusWhenNavigate,
  useNotification,
  useOverlayBlocker,
  useQueryParams,
  useRBAC,
  useTracking,
} from "@strapi/helper-plugin";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Table, Tbody, Td, Th, Thead, Tr } from "@strapi/design-system/Table";
import { bindActionCreators, compose } from "redux";
import { getMessage, handleAPIError } from "../../utils";
import { isArray, isEmpty } from "lodash";
import { resolveMultipleReports, resolveReport } from "../utils/api";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { BaseCheckbox } from "@strapi/design-system/BaseCheckbox";
import { Box } from "@strapi/design-system/Box";
import { Button } from "@strapi/design-system/Button";
import { Flex } from "@strapi/design-system/Flex";
import Nav from "../../components/Nav";
import NoAcccessPage from "../NoAccessPage";
import ReportsTableRow from "./components/ReportsTableRow";
import TableFilters from "../../components/TableFilters";
import TablePagination from "../../components/TablePagination";
import { Typography } from "@strapi/design-system/Typography";
import { VisuallyHidden } from "@strapi/design-system/VisuallyHidden";
import { check } from "../../components/icons";
import { connect } from "react-redux";
import { fetchReportsData } from "./utils/api";
import filtersSchema from "./utils/filtersSchema";
import getUrl from "../../utils/getUrl";
import isEqual from "react-fast-compare";
import makeAppView from "../App/reducer/selectors";
import { pluginId } from "../../pluginId";
import pluginPermissions from "../../permissions";
import { useHistory } from "react-router-dom";
import { useNotifyAT } from "@strapi/design-system/LiveRegions";

const tableHeaders = [
  "page.reports.table.header.id",
  "page.reports.table.header.reason",
  "page.reports.table.header.content",
  "page.reports.table.header.status",
  "page.reports.table.header.issueDate",
  "page.reports.table.header.relatedComment",
  "page.reports.table.header.actions",
];

const COL_COUNT = 8;

const Reports = ({ config }) => {
  const [storedReports, setStoredReports] = useState([]);
  const [selectedReports, setSelectedReports] = useState([]);

  useFocusWhenNavigate();

  const { push } = useHistory();
  const { notifyStatus } = useNotifyAT();
  const { trackUsage } = useTracking();
  const trackUsageRef = useRef(trackUsage);
  const toggleNotification = useNotification();
  const [{ query: queryParams }] = useQueryParams();
  const _q = queryParams?._q || "";
  const queryClient = useQueryClient();
  const { lockApp, unlockApp } = useOverlayBlocker();

  const viewPermissions = useMemo(
    () => ({
      access: pluginPermissions.access,
      moderate: pluginPermissions.moderate,
      accessReports: pluginPermissions.reports,
      reviewReports: pluginPermissions.reportsReview,
    }),
    [],
  );

  const {
    isLoading: isLoadingForPermissions,
    allowedActions: {
      canAccess,
      canModerate,
      canAccessReports,
      canReviewReports,
    },
  } = useRBAC(viewPermissions);

 

  const {
    isLoading: isLoadingForData,
    data: { result, pagination = {} },
    isFetching,
  } = useQuery(
    ["get-data", queryParams, canAccess],
    () => fetchReportsData(queryParams, toggleNotification),
    {
      initialData: {},
    },
  );

 
    console.log(result)

  useEffect(() => {
    setStoredReports(result);
  }, [result, storedReports]);

  const handleClickDisplay = (id) => {
    push(getUrl(`discover/${id}`));
  };

  const onSuccess = () => async () => {
    await queryClient.invalidateQueries("get-data");
    unlockApp();
  };

  const onError = (err) => {
    handleAPIError(err, toggleNotification);
  };

  const onSelectionChange = (selection) => setSelectedReports(selection);

  const handleItemSelectionChange = (selection, value) => {
    if (isArray(selection)) {
      onSelectionChange(value ? selection : []);
    } else {
      onSelectionChange(
        [...selectedReports, selection].filter(
          (item) => value || selection !== item,
        ),
      );
    }
  };

  const areAllItemsSelected = () =>
    !isEmpty(selectedReports)
      ? selectedReports.length === storedReports.length
      : false;

  const isItemSelected = (id) => selectedReports.includes(id);

  const hasAnySelectedReports = selectedReports.length > 0;

  const onValueChange = useCallback(
    (value) => {
      handleItemSelectionChange(
        storedReports.map((_) => _.id),
        value,
      );
    },
    [storedReports],
  );

  const resolveReportMutation = useMutation(resolveReport, {
    onSuccess: onSuccess(),
    onError,
    refetchActive: false,
  });

  const resolveMultipleReportsMutation = useMutation(resolveMultipleReports, {
    onSuccess: onSuccess(),
    onError,
    refetchActive: false,
  });

  const handleClickResolveSelected = async () => {
    if (canReviewReports) {
      lockApp();
      const items = await resolveMultipleReportsMutation.mutateAsync(
        selectedReports,
      );
      if (!isEmpty(items)) {
        const updatedReports = storedReports.map((_) => ({
          ..._,
          resolved: selectedReports.includes(_.id) ? true : _.resolved,
        }));
        setStoredReports(updatedReports);
        setSelectedReports([], false);
      }
    }
  };

  const isLoading = isLoadingForData || isFetching;
  const { total } = pagination;

  const emptyLayout = {
    comments: {
      id: getMessage("page.reports.table.empty"),
      defaultMessage: "You don't have any reports yet.",
    },
    search: {
      id: getMessage("page.reports.table.empty.search"),
      defaultMessage: "No reports match the search.",
    },
  };

  const emptyContent = _q ? "search" : "comments";

  return canAccess ? (
    <Box background="neutral100">
      <Layout>
        {isLoading || isLoadingForPermissions ? (
          <LoadingIndicatorPage />
        ) : (
          <Layout sideNav={<Nav visible />}>
            <>
              <HeaderLayout
                title={getMessage("page.reports.header")}
                subtitle={`${total} ${getMessage(
                  "page.discover.header.count",
                )}`}
                as="h2"
              />
              <ActionLayout
                startActions={
                  <>
                    <SearchURLQuery
                      label={getMessage("search.label", "Search", false)}
                    />
                    <TableFilters displayedFilters={filtersSchema} />
                    {hasAnySelectedReports && (
                      <Button
                        variant="success"
                        onClick={handleClickResolveSelected}
                        startIcon={check}>
                        {getMessage(
                          {
                            id: `page.details.panel.discussion.warnings.reports.dialog.actions.resolve.selected`,
                            props: {
                              count: selectedReports.length,
                            },
                          },
                          "Resolve selected",
                        )}
                      </Button>
                    )}
                  </>
                }
              />
              <ContentLayout>
                {!isEmpty(result) ? (
                  <>
                    <Table colCount={COL_COUNT} rowCount={result.length}>
                      <Thead>
                        <Tr>
                          <Th>
                            <BaseCheckbox
                              aria-label={getMessage(
                                "page.details.panel.discussion.warnings.reports.dialog.selectAll",
                              )}
                              value={areAllItemsSelected()}
                              disabled={isEmpty(storedReports)}
                              onValueChange={onValueChange}
                            />
                          </Th>

                          {tableHeaders.map((title) => (
                            <Th>
                              <Typography variant="sigma">
                                {getMessage(title)}
                              </Typography>
                            </Th>
                          ))}
                        </Tr>
                      </Thead>
                      <Tbody>
                        {result.map((entry) => {
                          return (
                            <ReportsTableRow
                              key={`comment-${entry.id}`}
                              config={config}
                              item={entry}
                              allowedActions={{
                                canModerate,
                                canAccessReports,
                                canReviewReports,
                              }}
                              onClick={() =>
                                handleClickDisplay(entry.related.id)
                              }
                              mutation={resolveReportMutation}
                              reports={storedReports}
                              updateReports={setStoredReports}
                              selectedReports={selectedReports}
                              onSelectionChange={onSelectionChange}
                              isChecked={isItemSelected}
                              handleItemSelectionChange={
                                handleItemSelectionChange
                              }
                            />
                          );
                        })}
                      </Tbody>
                    </Table>
                    <TablePagination
                      pagination={{ pageCount: pagination?.pageCount || 1 }}
                    />
                  </>
                ) : (
                  <EmptyStateLayout content={emptyLayout[emptyContent]} />
                )}
              </ContentLayout>
            </>
          </Layout>
        )}
      </Layout>
    </Box>
  ) :
    <NoAcccessPage />;

};
const mapStateToProps = makeAppView();

export const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({}, dispatch);
}
const withConnect = connect(mapStateToProps, mapDispatchToProps);

export default compose(withConnect)(memo(Reports, isEqual));

