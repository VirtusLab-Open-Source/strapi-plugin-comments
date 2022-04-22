/*
 *
 * Details
 *
 */

// @ts-nocheck
import React, { memo, useRef, useMemo, useState } from "react";
import { connect } from "react-redux";
import { bindActionCreators, compose } from "redux";
import isEqual from "react-fast-compare";
import { useQuery } from "react-query";
import { useRouteMatch } from "react-router-dom";
import {
  Layout,
  HeaderLayout,
  TwoColsLayout,
  ContentLayout,
} from "@strapi/design-system/Layout";
import { Box } from "@strapi/design-system/Box";
import { Link } from "@strapi/design-system/Link";
import { Loader } from "@strapi/design-system/Loader";
import { useNotifyAT } from "@strapi/design-system/LiveRegions";
import { ArrowLeft } from "@strapi/icons";

import { isEmpty } from "lodash";
import {
  LoadingIndicatorPage,
  useTracking,
  useNotification,
  useRBAC,
  useFocusWhenNavigate,
} from "@strapi/helper-plugin";
import getMessage from "../../utils/getMessage";
import { fetchDetailsData, fetchContentTypeData } from "../utils/api";
import pluginPermissions from "../../permissions";
import { getUrl, parseRegExp } from "../../utils";
import Nav from "../../components/Nav";
import DetailsEntity from "./components/DetailsEntity";
import DiscussionThread from "../../components/DiscussionThread";
import makeAppView from "../App/reducer/selectors";

const Details = ({ config }) => {
  useFocusWhenNavigate();

  const {
    params: { id },
  } = useRouteMatch(getUrl(`discover/:id`));

  const { notifyStatus } = useNotifyAT();
  const { trackUsage } = useTracking();
  const trackUsageRef = useRef(trackUsage);
  const toggleNotification = useNotification();

  const viewPermissions = useMemo(
    () => ({
      access: pluginPermissions.access,
      moderate: pluginPermissions.moderate,
      accessReports: pluginPermissions.reports,
      reviewReports: pluginPermissions.reportsReview,
    }),
    []
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

  const [filters, setFilters] = useState({});

  const regexUID = new RegExp(
    parseRegExp(config.regex.uid).value,
    parseRegExp(config.regex.uid).flags
  );

  const {
    isLoading: isLoadingForData,
    data,
    isFetching,
  } = useQuery(
    ["get-details-data", id, filters, canAccess],
    () => fetchDetailsData(id, filters, toggleNotification),
    {
      initialData: {},
    }
  );

  const { entity, level, selected } = data;
  const entityUidValid = entity?.uid && regexUID.test(entity.uid);

  const { data: contentTypeData } = useQuery(
    ["get-additional-data", entity?.uid, canAccess],
    () => fetchContentTypeData(entity?.uid, toggleNotification),
    {
      enabled: !!entity?.uid,
      suspense: !entityUidValid,
    }
  );

  const handleChangeFilters = (props) => setFilters(props);

  const isLoading = isLoadingForData || isFetching;

  if (canAccess) {
    return (
      <Box background="neutral100">
        <Layout>
          {(isLoading || isLoadingForPermissions) && isEmpty(data) ? (
            <LoadingIndicatorPage />
          ) : (
            <>
              <HeaderLayout
                navigationAction={
                  <Link startIcon={<ArrowLeft />} to={getUrl(`discover`)}>
                    {getMessage("HeaderLayout.link.go-back", "Back", false)}
                  </Link>
                }
                title={getMessage("page.details.header")}
                subtitle={getMessage("page.details.header.description")}
                as="h2"
              />
              <ContentLayout>
                <TwoColsLayout
                  startCol={
                    <DiscussionThread
                      level={level}
                      selected={selected}
                      isReloading={isLoading}
                      allowedActions={{
                        canModerate,
                        canAccessReports,
                        canReviewReports,
                      }}
                    />
                  }
                  endCol={
                    <DetailsEntity
                      data={entity}
                      schema={contentTypeData?.schema}
                      config={config}
                      filters={filters}
                      onFiltersChange={handleChangeFilters}
                    />
                  }
                />
              </ContentLayout>
            </>
          )}
        </Layout>
      </Box>
    );
  }
  return null;
};

const mapStateToProps = makeAppView();

export function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch);
}
const withConnect = connect(mapStateToProps, mapDispatchToProps);

export default compose(withConnect)(memo(Details, isEqual));
