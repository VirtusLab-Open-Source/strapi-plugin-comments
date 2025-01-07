import { Box, Loader } from '@strapi/design-system';
import styled from 'styled-components';

const LoadingIndicatorOverlayWrapper = styled(Box)(() => {
  return {
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.7)',
    bottom: 0,
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  };
});
export const LoadingIndicatorOverlay = () => (
  <LoadingIndicatorOverlayWrapper>
    <Loader />
  </LoadingIndicatorOverlayWrapper>
);