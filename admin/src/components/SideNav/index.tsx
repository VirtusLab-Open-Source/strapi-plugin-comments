import { Flex, Link, SubNav, SubNavHeader, SubNavLink, SubNavSection, SubNavSections } from '@strapi/design-system';

import { getMessage } from '../../utils';

export const SideNav = () => {
  return (
    <>
      <SubNav aria-label="Comments sub nav" display={{ initial: 'none', large: 'block' }}>
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
      <Flex 
        display={{ initial: 'flex', large: 'none' }}
        direction="column"
        gap={2}
        top="80px"
        right="20px"
        position="absolute"
      >
        <Link href="/admin/plugins/comments/discover">
          {getMessage('nav.item.discover')}
        </Link>
        <Link href="/admin/plugins/comments/reports">
          {getMessage('nav.item.reports')}
        </Link>
      </Flex>
    </>
  );
};