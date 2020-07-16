/*
 *
 * CommentsPanel
 *
 */

import React, { memo } from 'react';
import ListView from '../ListView';
import DetailsView from '../DetailsView';

const Panel = () => (
  <div className="container-fluid">
    <div className="row">
      <ListView />
      <DetailsView />
    </div>
  </div>
);

export default memo(Panel);
