/* eslint-disable react/no-danger */
/**
 *
 * PreviewWysiwyg
 *
 */

import React, { memo, useMemo } from 'react';
import md from './utils/mdRenderer';
import sanitizeHtml from './utils/satinizeHtml';
import Wrapper from './Wrapper';

type PreviewWysiwygProps = {
  data: string
}
const PreviewWysiwyg: React.FC<PreviewWysiwygProps> = ({ data }) => {
  const html = useMemo(() => sanitizeHtml(md.render(data || '')), [data]);

  return (
    <Wrapper>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </Wrapper>
  );
};



export default memo(PreviewWysiwyg);
