import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { isEmpty } from 'lodash';
import CardWrapper from './CardWrapper';
import CardItem from './CardItem';
import CardLevelCounter from './CardLevelCounter';
import CardLevelCounterLink from './CardLevelCounterLink';
import ItemFooter from '../ItemFooter';
import ItemModeration from '../ItemModeration';
import ItemHeader from '../ItemHeader';
import AbuseReportsPopUp from '../AbuseReportsPopUp';

const ItemDetails = ({ id, content, active, clickable, root, threadsCount, authorName, authorUser, created_at, updated_at, related, reports, blocked, blockedThread, onClick, onBlockClick, onBlockThreadClick, onAbuseReportResolve }) => {
  const [showPopUp, setPopUpVisibility] = useState(false);

  const onPopUpOpen = e => {
    e.preventDefault();
    e.stopPropagation();
    setPopUpVisibility(true);
  };

  const onPopUpClose = e => {
    e.preventDefault();
    e.stopPropagation();
    setPopUpVisibility(false);
  };

  const onAbuseReportResolveClick = (e, reportId) => {
    e.preventDefault();
    e.stopPropagation();
    onAbuseReportResolve(reportId, id);
  };
  
  const hasThreads = (threadsCount !== undefined) && (threadsCount > 0);
  const isAbuseReported = !isEmpty(reports);
  const isItemHeaderDisplayed = blocked || blockedThread || isAbuseReported;
  const footerProps = {
    authorName,
    authorUser,
    related,
    created_at,
    updated_at,
    isDelailedView: true,
  };
  const headerProps = {
    active,
    blocked,
    blockedThread,
    abuseReports: reports || [],
    isAbuseReported: !isEmpty(reports),
    isDelailedView: true,
    onReportsClick: onPopUpOpen,
  };
  const moderationProps = {
    id,
    blocked,
    blockedThread,
    onBlockClick,
    onBlockThreadClick,
  };
  const reportsPopUpProps = {
    blocked,
    blockedThread,
    reports,
    comment: {
      id, content, authorName, authorUser, created_at, created_at, updated_at,
    },
    onBlockClick,
    onBlockThreadClick,
    onAbuseReportResolveClick,
    isOpen: showPopUp,
    onClose: onPopUpClose,
  };

  return (
    <CardWrapper root={root} active={active}>
      <CardItem 
        onClick={e => (hasThreads || root) && clickable && !active && onClick(e)}
        clickable={clickable}
        root={root}
        active={active}>
        { isItemHeaderDisplayed && (<ItemHeader { ...headerProps } />) }
        <p>{content}</p>
        <ItemFooter {...footerProps} />
      </CardItem>
      { hasThreads && (<CardLevelCounter>
          <span>{threadsCount}</span> thread{threadsCount > 1 ? 's' : ''}
          <CardLevelCounterLink onClick={onClick}>
            Drilldown
            <FontAwesomeIcon icon={faArrowRight} />
          </CardLevelCounterLink>
        </CardLevelCounter>
      )}
      { active && (<ItemModeration { ...moderationProps } />) }
      { (!isEmpty(reports) && active) && (
        <AbuseReportsPopUp
          {...reportsPopUpProps}
        />
      )}
    </CardWrapper>
  );
};

export default ItemDetails;