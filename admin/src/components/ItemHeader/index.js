import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useGlobalContext, CheckPermissions } from 'strapi-helper-plugin';
import { faLock, faStream, faAsterisk, faFire, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import Wrapper from './Wrapper';
import CardHeaderBlocked from './CardHeaderBlocked';
import CardHeaderPending from './CardHeaderPending';
import pluginId from '../../pluginId';
import CardHeaderIndicatorsContainer from './CardHeaderIndicatorsContainer';
import CardHeaderIndicatorBlue from './CardHeaderIndicatorBlue';
import CardHeaderIndicatorRed from './CardHeaderIndicatorRed';
import CardHeaderReports from './CardHeaderReports';
import pluginPermissions from '../../permissions';
import { APPROVAL_STATUS } from "../../utils/constants";

const ItemHeader = ({ active, isDetailedView, blocked, blockedThread, isNew, isAbuseReported, isRemoved, abuseReports, onReportsClick, approvalStatus }) => {
  const { formatMessage } = useGlobalContext();
  const isBlocked = blocked || blockedThread;
  const hasAnyIndicators = isNew || (isAbuseReported && !isDetailedView);

  return (
    <Wrapper hasMargin={isBlocked || isRemoved || (isAbuseReported && isDetailedView)}>
      {isBlocked && (
        <CheckPermissions permissions={pluginPermissions.moderate}>
          <CardHeaderBlocked>
            <FontAwesomeIcon icon={faLock} />
            {blockedThread && <FontAwesomeIcon icon={faStream} />}
            <FormattedMessage id={`${pluginId}.list.item.header.blocked${blockedThread ? '.thread' : ''}`} />
          </CardHeaderBlocked>
        </CheckPermissions>
      )}
      {
        isRemoved && (
          <CheckPermissions permissions={pluginPermissions.moderate}>
            <CardHeaderBlocked>
              <FontAwesomeIcon icon={faLock} />
              {blockedThread && <FontAwesomeIcon icon={faStream} />}
              <FormattedMessage id={`${pluginId}.list.item.header.removed`} />
            </CardHeaderBlocked>
          </CheckPermissions>
        )
      }
      {
        approvalStatus === APPROVAL_STATUS.PENDING && (
          <CheckPermissions permissions={pluginPermissions.moderate}>
            <CardHeaderPending>
              <FontAwesomeIcon icon={faExclamationCircle} />
              <FormattedMessage id={`${pluginId}.list.item.header.pending`} />
            </CardHeaderPending>
          </CheckPermissions>
        )
      }
      {(isDetailedView && active) && (<>
        {isAbuseReported && (
          <CheckPermissions permissions={pluginPermissions.moderateReports}>
            <CardHeaderReports href="#abuse-reports" onClick={onReportsClick}>
              <FontAwesomeIcon icon={faFire} />
              <FormattedMessage id={`${pluginId}.list.item.header.abuse`} values={{ count: abuseReports.length }} />
            </CardHeaderReports>
          </CheckPermissions>
        )}
      </>)}
      {hasAnyIndicators && <CardHeaderIndicatorsContainer>
          {isNew && (<CardHeaderIndicatorBlue title={formatMessage({ id: `${pluginId}.list.item.indication.new`})}>
            <FontAwesomeIcon icon={faAsterisk} />
          </CardHeaderIndicatorBlue>)} 
          <CheckPermissions permissions={pluginPermissions.moderateReports}>
            {isAbuseReported && (<CardHeaderIndicatorRed title={formatMessage({ id: `${pluginId}.list.item.indication.abuse`})}>
              <FontAwesomeIcon icon={faFire} />
            </CardHeaderIndicatorRed>)}
          </CheckPermissions>
        </CardHeaderIndicatorsContainer>
      }
    </Wrapper>
  );
};

ItemHeader.propTypes = {
  active: PropTypes.bool,
  isDetailedView: PropTypes.bool,
  blocked: PropTypes.bool,
  blockedThread: PropTypes.bool,
  isNew: PropTypes.bool,
  removed: PropTypes.bool,
  isAbuseReported: PropTypes.bool,
  abuseReports: PropTypes.array,
  onReportsClick: PropTypes.func,
  approvalStatus: PropTypes.oneOf([
    APPROVAL_STATUS.APPROVED,
    APPROVAL_STATUS.PENDING,
    APPROVAL_STATUS
  ])
};

export default ItemHeader;
