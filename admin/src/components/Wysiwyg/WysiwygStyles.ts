/*
 *
 * WYSIWYG Styles
 *
 */
//@ts-ignore
import styled, {ThemeInterface} from 'styled-components';
//@ts-ignore
import { IconButtonGroup, IconButton } from '@strapi/design-system/IconButton';
//@ts-ignore
import { BaseButton } from '@strapi/design-system/BaseButton';

// NAV BUTTONS
export const CustomIconButton = styled(IconButton)`
  padding: ${({ theme }:ThemeInterface) => theme.spaces[2]};
  /* Trick to prevent the outline from overflowing because of the general outline-offset */
  outline-offset: -2px !important;

  svg {
    width: ${18 / 16}rem;
    height: ${18 / 16}rem;
  }
`;

export const CustomLinkIconButton = styled(CustomIconButton)`
  svg {
    width: ${8 / 16}rem;
    height: ${8 / 16}rem;
  }
`;

export const MainButtons = styled(IconButtonGroup)`
  
`;

export const MoreButton = styled(IconButton)`
  margin: ${({ theme }:ThemeInterface) => `0 ${theme.spaces[2]}`};
  padding: ${({ theme }:ThemeInterface) => theme.spaces[2]};

  svg {
    width: ${18 / 16}rem;
    height: ${18 / 16}rem;
  }
`;

// NAV

export const IconButtonGroupMargin = styled(IconButtonGroup)`
  margin-right: ${({ theme }:ThemeInterface) => `${theme.spaces[2]}`};
`;

// EDITOR && PREVIEW

export const EditorAndPreviewWrapper = styled.div`
  position: relative;
  height: calc(100% - 48px);
`;

// FOOTER
export const ExpandButton = styled(BaseButton)`
  background-color: transparent;
  border: none;
  align-items: center;

  svg {
    margin-left: ${({ theme }:ThemeInterface) => `${theme.spaces[2]}`};
    path {
      fill: ${({ theme }:ThemeInterface) => theme.colors.neutral700};
      width: ${12 / 16}rem;
      height: ${12 / 16}rem;
    }
  }
`;
