/*
 *
 * DetailsView
 *
 */

import React from 'react';
import { useHistory } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { isNil } from 'lodash';
import { useGlobalContext, LoadingIndicatorPage } from 'strapi-helper-plugin';
import { Header } from '@buffetjs/custom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments } from '@fortawesome/free-solid-svg-icons';

import Wrapper from './Wrapper';
import ItemDetails from '../../components/ItemDetails';
import CardWrapper from '../../components/ItemDetails/CardWrapper';
import CardLevelWrapper from '../../components/ItemDetails/CardLevelWrapper';
import EmptyView from '../../components/EmptyView';

import pluginId from '../../pluginId';
import getTradId from '../../utils/getTradId';
import getTrad from '../../utils/getTrad';

import useDataManager from '../../hooks/useDataManager';

const DetailsView = () => {
  const {
    activeItem,
    isLoadingForDetailsDataToBeSet,
    blockComment,
    blockCommentThread,
    resolveAbuseReport,
  } = useDataManager();

  const { formatMessage } = useGlobalContext();
  const { push } = useHistory();

  const onCommentClick = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    push(`/plugins/${pluginId}/display/${id}`)
  }

  const renderCommentsTree = (selected, items) => {
    return (<CardLevelWrapper>
        {
          items.map((item, n) => {
            const active = item.id === selected.id;
            const threadsCount = item.children && item.children.length;
            const hasThreads = threadsCount > 0;
            const clickable = !active && hasThreads && !isNil(selected.threadOf);
            return (<ItemDetails
              key={`list-item-details-${item.id || n}`}
              {...item}
              active={active}
              root={selected.threadOf === null}
              clickable={clickable}
              threadsCount={threadsCount}
              onAbuseReportResolve={resolveAbuseReport}
              onBlockClick={blockComment}
              onBlockThreadClick={blockCommentThread}
              onClick={e => onCommentClick(e, hasThreads ? item.children[0].id : item.id)}
              />)
          })
        }
      </CardLevelWrapper>)
  }

  const { selected, level } = activeItem || {};

  return (
    <Wrapper className="col-md-8">
      { isLoadingForDetailsDataToBeSet && <LoadingIndicatorPage />}
      { !isLoadingForDetailsDataToBeSet && !activeItem && (<EmptyView fixPosition>
          <FontAwesomeIcon icon={faComments} size="5x" />
          <FormattedMessage id={getTrad('moderation.content.empty')} />
        </EmptyView>)}
      { activeItem && (<>
        { selected.threadOf && (<CardLevelWrapper>
            <ItemDetails
              {...selected.threadOf}
              clickable={true}
              root={true}
              onAbuseReportResolve={resolveAbuseReport}
              onClick={e => onCommentClick(e, selected.threadOf.id)}
            />
            <CardWrapper root={true}>
              {renderCommentsTree(selected, level)}
            </CardWrapper>
          </CardLevelWrapper>)}
        {!selected.threadOf && renderCommentsTree(selected, level)}
      </>)}
    </Wrapper>
  );
};

export default DetailsView;
