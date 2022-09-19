/*
 *
 * Coming soon page
 *
 */

// TODO
// @ts-nocheck
import React, { memo } from "react";
import { Box } from "@strapi/design-system/Box";
import { EmptyStateLayout } from "@strapi/design-system/EmptyStateLayout";
import { Layout } from "@strapi/design-system/Layout";
import { illo } from "../../components/icons";
import getMessage from "../../utils/getMessage";
import Nav from "../../components/Nav";

const ComingSoonPage = () => {
  return (
    <Box background="neutral100">
      <Layout sideNav={<Nav />}>
        <Box padding={8} background="neutral100">
          <EmptyStateLayout
            icon={illo}
            content={getMessage("page.coming.soon")}
          />
        </Box>
      </Layout>
    </Box>
  );
};

export default memo(ComingSoonPage);
