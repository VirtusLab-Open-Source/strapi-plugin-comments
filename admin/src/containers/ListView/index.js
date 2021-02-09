/*
 *
 * ListView
 *
 */

import React from 'react';
import { useGlobalContext, LoadingIndicatorPage } from 'strapi-helper-plugin';
import { FormattedMessage } from 'react-intl';
import { isEmpty } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

import Footer from './Footer';
import Wrapper from './Wrapper';
import FadedWrapper from './FadedWrapper';

import List from '../../components/List';
import EmptyView from '../../components/EmptyView';

import useDataManager from '../../hooks/useDataManager';

import getTrad from '../../utils/getTrad';

const ListView = () => {
  const { items, isLoadingForDataToBeSet } = useDataManager();

  return (
    <Wrapper className="col-md-4">
      {isLoadingForDataToBeSet && <LoadingIndicatorPage />}
      <FadedWrapper>
        {isEmpty(items) && (
          <EmptyView>
            <FontAwesomeIcon icon={faSearch} size="5x" />
            <FormattedMessage id={getTrad('list.content.empty')} />
          </EmptyView>
        )}
        {!isEmpty(items) && <List items={[...items]} />}
      </FadedWrapper>
      <Footer />
    </Wrapper>
  );
};

export default ListView;
