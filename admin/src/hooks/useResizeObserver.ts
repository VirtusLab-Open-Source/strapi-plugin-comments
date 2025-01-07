import { useCallbackRef } from '@strapi/design-system';
import { MutableRefObject, useLayoutEffect } from 'react';

export const useResizeObserver = (sources: MutableRefObject<HTMLElement | null>, onResize: ResizeObserver['observe']) => {
  const handleResize = useCallbackRef(onResize);
  useLayoutEffect(() => {
    const resizeObs = new ResizeObserver(handleResize);
    if (Array.isArray(sources)) {
      sources.forEach((source) => {
        if (source.current) {
          resizeObs.observe(source.current);
        }
      });
    } else if (sources.current) {
      resizeObs.observe(sources.current);
    }
    return () => {
      resizeObs.disconnect();
    };
  }, [sources, handleResize]);
};