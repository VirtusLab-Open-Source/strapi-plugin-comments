import { SubNav, SubNavHeader, SubNavLink, SubNavSection, SubNavSections } from '@strapi/design-system';

import { getMessage } from '../../utils';

export const SideNav = () => {
  return (
    <SubNav ariaLabel="Comments sub nav">
      <SubNavHeader label={getMessage('plugin.name')} />
      <SubNavSections>
        <SubNavSection label={getMessage('nav.header.moderation')}>
          <SubNavLink href="/admin/plugins/comments/discover">
            {getMessage('nav.item.discover')}
          </SubNavLink>
          <SubNavLink
            href="/admin/plugins/comments/reports"
            withBullet={false}
          >
            {getMessage('nav.item.reports')}
          </SubNavLink>
        </SubNavSection>
      </SubNavSections>
    </SubNav>
  );
};