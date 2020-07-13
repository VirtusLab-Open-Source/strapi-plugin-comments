/*
 *
 * DetailsView
 *
 */

import React from 'react';
import { useHistory } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { useGlobalContext, LoadingIndicatorPage } from 'strapi-helper-plugin';
import useDataManager from '../../hooks/useDataManager';
import PropTypes from 'prop-types';
import { Header } from '@buffetjs/custom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments } from '@fortawesome/free-solid-svg-icons';
import pluginId from '../../pluginId';
import ItemDetails from '../../components/ItemDetails';
import Wrapper from './Wrapper';
import CardWrapper from '../../components/ItemDetails/CardWrapper';
import CardLevelWrapper from '../../components/ItemDetails/CardLevelWrapper';
import EmptyView from '../../components/EmptyView';

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
          items.map(item => {
            const active = item.id === selected.id;
            const threadsCount = item.children && item.children.length;
            const hasThreads = threadsCount > 0;
            const clickable = !active && hasThreads && selected.threadOf;
            return (<ItemDetails
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
      <Header
        title={{ label: formatMessage({ id: `${pluginId}.moderation.header.title` })}}
        content={formatMessage({ id: `${pluginId}.moderation.header.description` })}
      />
      { isLoadingForDetailsDataToBeSet && <LoadingIndicatorPage />}
      { !isLoadingForDetailsDataToBeSet && !activeItem && (<EmptyView fixPosition>
          <FontAwesomeIcon icon={faComments} size="5x" />
          <FormattedMessage id={`${pluginId}.moderation.content.empty`} />
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

DetailsView.defaultProps = {
  wait: () => {},
};

DetailsView.propTypes = {
  wait: PropTypes.func,
};

export default DetailsView;
