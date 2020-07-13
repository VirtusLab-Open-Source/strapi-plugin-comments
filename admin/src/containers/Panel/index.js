/*
 *
 * CommentsPanel
 *
 */

import React, { memo } from 'react';
import { LeftMenuList, useGlobalContext } from 'strapi-helper-plugin';
// import PropTypes from 'prop-types';
import pluginId from '../../pluginId';
import ListView from '../ListView';
import DetailsView from '../DetailsView';

const Panel = () => {
  return (
    <div className="container-fluid">
      <div className="row">
        <ListView />
        <DetailsView />
      </div>
    </div>
  );
};

export default memo(Panel);
