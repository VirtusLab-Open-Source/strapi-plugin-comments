import { Flex, Link, SubNav, SubNavHeader, SubNavLink, SubNavSection, SubNavSections } from '@strapi/design-system';
import { NavLink } from 'react-router-dom';

import { getMessage } from '../../utils';
import { Box } from '@strapi/design-system';

export const SideNav = () => {
  return (
    <>
      <SubNav aria-label="Comments sub nav" display={{ initial: 'none', large: 'block' }}>
        <SubNavHeader label={getMessage('plugin.name')} />
        <SubNavSections>
          <SubNavSection label={getMessage('nav.header.moderation')}>
            <SubNavLink tag={NavLink} to="/plugins/comments/discover">
              {getMessage('nav.item.discover')}
            </SubNavLink>
            <SubNavLink to="/plugins/comments/reports" tag={NavLink} withBullet={false}>
              {getMessage('nav.item.reports')}
            </SubNavLink>
          </SubNavSection>
        </SubNavSections>
      </SubNav>
      <Box
        display={{ initial: 'flex', large: 'none' }}
        top="80px"
        right="20px"
        position="absolute"
      >
        <Flex 
          direction="column"
          gap={2}
        >
          <Link tag={NavLink} to="/plugins/comments/discover">
            {getMessage('nav.item.discover')}
          </Link>
          <Link tag={NavLink} to="/plugins/comments/reports">
            {getMessage('nav.item.reports')}
          </Link>
        </Flex>
      </Box>
    </>
  );
};
