import { SubNav, SubNavHeader, SubNavLink, SubNavSection, SubNavSections } from '@strapi/design-system';

import { getMessage } from '../../utils';

export const SideNav = () => {
  return (
    <SubNav aria-label="Comments sub nav">
      <SubNavHeader label={getMessage('plugin.name')} />
      <SubNavSections>
        <SubNavSection label={getMessage('nav.header.moderation')}>
          <SubNavLink href="/admin/plugins/@alfanet-technologies/strapi-plugin-comments/discover">
            {getMessage('nav.item.discover')}
          </SubNavLink>
          <SubNavLink
            href="/admin/plugins/@alfanet-technologies/strapi-plugin-comments/reports"
            withBullet={false}
          >
            {getMessage('nav.item.reports')}
          </SubNavLink>
        </SubNavSection>
      </SubNavSections>
    </SubNav>
  );
};