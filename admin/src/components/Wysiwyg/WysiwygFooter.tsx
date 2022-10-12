/*
 *
 * Details
 *
 */

import React from 'react';
import { useIntl } from 'react-intl';
//@ts-ignore
import { Box } from '@strapi/design-system/Box';
//@ts-ignore
import { Flex } from '@strapi/design-system/Flex';
//@ts-ignore
import { Typography } from '@strapi/design-system/Typography';
//@ts-ignore
import Expand from '@strapi/icons/Expand';
import { ExpandButton } from './WysiwygStyles';

type WysiwyhFooterProps = {
  onToggleExpand: () => void
}

const WysiwygFooter: React.FC<WysiwyhFooterProps> = ({ onToggleExpand }) => {
  const { formatMessage } = useIntl();

  return (
    <Box padding={2} background="neutral100" hasRadius>
      <Flex justifyContent="flex-end" alignItems="flex-end">
        <ExpandButton id="expand" onClick={onToggleExpand}>
          <Typography>
            {formatMessage({
              id: 'components.WysiwygBottomControls.fullscreen',
              defaultMessage: 'Expand',
            })}
          </Typography>
          <Expand />
        </ExpandButton>
      </Flex>
    </Box>
  );
};

export default WysiwygFooter;
