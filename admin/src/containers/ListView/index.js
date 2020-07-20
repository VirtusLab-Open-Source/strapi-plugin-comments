/*
 *
 * ListView
 *
 */

import React from 'react';
import { useGlobalContext, LoadingIndicatorPage } from 'strapi-helper-plugin';
import { FormattedMessage } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import useDataManager from '../../hooks/useDataManager';
import { isEmpty } from 'lodash';
import { Header } from '@buffetjs/custom';
import Footer from './Footer';
import Wrapper from './Wrapper';
import FadedWrapper from './FadedWrapper';
import List from '../../components/List';
import EmptyView from '../../components/EmptyView';
import pluginId from '../../pluginId';

const ListView = () => {
  const {
    items,
    isLoadingForDataToBeSet,
  } = useDataManager();

  const { formatMessage } = useGlobalContext();
  const newItemsCount = items.filter(_ => _.isNew).length;

  return (
    <Wrapper className="col-md-4">
      <Header
        title={{ label: formatMessage({ id: `${pluginId}.list.header.title` })}}
        content={formatMessage({ id: `${pluginId}.list.header.description` }, { count: newItemsCount })}
      />
      { isLoadingForDataToBeSet && <LoadingIndicatorPage /> }
      <FadedWrapper>
        { isEmpty(items) && (<EmptyView>
          <FontAwesomeIcon icon={faSearch} size="5x" />
          <FormattedMessage id={`${pluginId}.list.content.empty`} />
        </EmptyView>)}
        { !isEmpty(items) && (<List items={[...items]} />)}
      </FadedWrapper>
      <Footer />
    </Wrapper>
  );
};

export default ListView;
