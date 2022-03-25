/*
 *
 * Nav
 *
 */

// @ts-nocheck

import React from "react";
import {
  SubNav,
  SubNavHeader,
  SubNavSection,
  SubNavSections,
  SubNavLink,
} from "@strapi/design-system/SubNav";
import { ExclamationMarkCircle, Apps } from "@strapi/icons";
import getMessage from "../../utils/getMessage";

// import PropTypes from 'prop-types';
import getUrl from "../../utils/getUrl";

const Nav = ({ visible = false, hasNewComments, hasNewReports }) => {
  if (!visible) {
    return null;
  }

  return (
    <SubNav ariaLabel="Comments sub nav">
      <SubNavHeader label={getMessage("plugin.name")} />
      <SubNavSections>
        <SubNavLink
          to={getUrl("dashboard")}
          withBullet={hasNewComments}
          icon={<Apps />}
        >
          {getMessage("nav.item.updates")}
        </SubNavLink>
        <SubNavSection label={getMessage("nav.header.moderation")}>
          <SubNavLink to={getUrl("discover")} icon={<Apps />}>
            {getMessage("nav.item.discover")}
          </SubNavLink>
          <SubNavLink
            to={getUrl("reports")}
            withBullet={hasNewReports}
            icon={<Apps />}
          >
            {getMessage("nav.item.reports")}
          </SubNavLink>
        </SubNavSection>
        <SubNavSection label={getMessage("nav.header.settings")}>
          <SubNavLink to={getUrl("settings")} icon={<Apps />}>
            {getMessage("nav.item.settings")}
          </SubNavLink>
        </SubNavSection>
      </SubNavSections>
    </SubNav>
  );
};

export default Nav;
