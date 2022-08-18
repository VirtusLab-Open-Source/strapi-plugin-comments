/*
 *
 * Nav
 *
 */

// TODO
// @ts-nocheck

import React from "react";
import {
  SubNav,
  SubNavHeader,
  SubNavSection,
  SubNavSections,
  SubNavLink,
} from "@strapi/design-system/SubNav";
import { apps } from "../icons";
import getMessage from "../../utils/getMessage";

// import PropTypes from 'prop-types';
import getUrl from "../../utils/getUrl";

const Nav = ({ visible = false, hasNewComments, hasNewReports }) => {
  if (!visible) {
    return null;
  }

  return (
    <SubNav ariaLabel='Comments sub nav'>
      <SubNavHeader label={getMessage('plugin.name')} />
      <SubNavSections>
        {/* TODO - further subpages development */}
        {/* <SubNavLink
          to={getUrl("dashboard")}
          withBullet={hasNewComments}
          icon={apps}
        >
          {getMessage("nav.item.updates")}
        </SubNavLink> */}
        <SubNavSection label={getMessage('nav.header.moderation')}>
          <SubNavLink to={getUrl('discover')} icon={apps}>
            {getMessage('nav.item.discover')}
          </SubNavLink>
          <SubNavLink
            to={getUrl('reports')}
            withBullet={hasNewReports}
            icon={apps}>
            {getMessage('nav.item.reports')}
          </SubNavLink>
        </SubNavSection>
        {/* TODO - further subpages development */}
        {/* <SubNavSection label={getMessage("nav.header.settings")}>
          <SubNavLink to={getUrl("settings")} icon={apps}>
            {getMessage("nav.item.settings")}
          </SubNavLink>
        </SubNavSection> */}
      </SubNavSections>
    </SubNav>
  );
};

export default Nav;
