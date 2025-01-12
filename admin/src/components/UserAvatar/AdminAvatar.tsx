import { Box, Flex } from '@strapi/design-system';
import { Shield } from '@strapi/icons';

import { FC, PropsWithChildren } from 'react';


export const AdminAvatar: FC<PropsWithChildren> = ({ children }) => (
  <Box position="relative">
    {children}
    <Flex
      padding="2px"
      alignItems="middle"
      position="absolute"
      right="-30%"
      top="-30%"
      borderRadius="50%"
      border="2px #ffffff solid"
      background="#ffffff"
    >
      <Shield />
    </Flex>
  </Box>
);