//@ts-nocheck

import {
    ActionLayout,
    ContentLayout,
    HeaderLayout,
    Layout,
} from '@strapi/design-system/Layout';
import React, {memo, useMemo, useRef, useState} from 'react';
import {Table, Tbody, Td, Th, Thead, Tr} from '@strapi/design-system/Table';
import {bindActionCreators, compose} from 'redux';

import {Box} from '@strapi/design-system/Box';
import LatestComments from './components/LatestComments';
import LatestReports from './components/LatestReports';
import Nav from '../../components/Nav';
import { StyledBox } from './styles';
import {Typography} from '@strapi/design-system/Typography';
import {connect} from 'react-redux';
import isEqual from 'react-fast-compare';
import makeAppView from '../App/reducer/selectors';

const DashboardPage = ({ config }) => {

      
    return (
      <Box background="neutral100">
          <Layout sideNav={<Nav visible />}>
                <HeaderLayout
                title="Dashboard Page"
                as="h1"
                />
              <ContentLayout>
                  <LatestReports config={config} />
                  <LatestComments config={config} />
              </ContentLayout>
          </Layout>
      </Box>
    )
}

const mapStateToProps = makeAppView();

export function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch);
}
const withConnect = connect(mapStateToProps, mapDispatchToProps);

export default compose(withConnect)(memo(DashboardPage, isEqual));