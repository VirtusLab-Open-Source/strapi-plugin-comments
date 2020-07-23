import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useGlobalContext, CheckPermissions } from 'strapi-helper-plugin';
import { faLock, faStream, faAsterisk, faFire } from '@fortawesome/free-solid-svg-icons';
import Wrapper from './Wrapper';
import CardHeaderBlocked from './CardHeaderBlocked';
import pluginId from '../../pluginId';
import CardHeaderIndicatorsContainer from './CardHeaderIndicatorsContainer';
import CardHeaderIndicatorBlue from './CardHeaderIndicatorBlue';
import CardHeaderIndicatorRed from './CardHeaderIndicatorRed';
import CardHeaderReports from './CardHeaderReports';
import pluginPermissions from '../../permissions';

const ItemHeader = ({ active, isDelailedView, blocked, blockedThread, isNew, isAbuseReported, abuseReports, onReportsClick }) => {
  const { formatMessage } = useGlobalContext();
  const isBlocked = blocked || blockedThread;
  const hasAnyIndicators = isNew || (isAbuseReported && !isDelailedView);

  return (
    <Wrapper hasMargin={isBlocked || (isAbuseReported && isDelailedView)}>
      { isBlocked && (
        <CheckPermissions permissions={pluginPermissions.moderate}>
          <CardHeaderBlocked>
            <FontAwesomeIcon icon={faLock} />
            {blockedThread && <FontAwesomeIcon icon={faStream} />}
            <FormattedMessage id={`${pluginId}.list.item.header.blocked${blockedThread ? '.thread' : ''}`} />
          </CardHeaderBlocked>
        </CheckPermissions>
      ) }
      { (isDelailedView && active) && (<>
        { isAbuseReported && (
          <CheckPermissions permissions={pluginPermissions.moderateReports}>
            <CardHeaderReports href="#abuse-reports" onClick={onReportsClick}>
              <FontAwesomeIcon icon={faFire} />
              <FormattedMessage id={`${pluginId}.list.item.header.abuse`} values={{ count: abuseReports.length }} />
            </CardHeaderReports>
          </CheckPermissions>
        )}
      </>)}
      {hasAnyIndicators && <CardHeaderIndicatorsContainer>
          { isNew && (<CardHeaderIndicatorBlue title={formatMessage({ id: `${pluginId}.list.item.indication.new`})}>
            <FontAwesomeIcon icon={faAsterisk} />
          </CardHeaderIndicatorBlue>) }
          <CheckPermissions permissions={pluginPermissions.moderateReports}>
            { isAbuseReported && (<CardHeaderIndicatorRed title={formatMessage({ id: `${pluginId}.list.item.indication.abuse`})}>
              <FontAwesomeIcon icon={faFire} />
            </CardHeaderIndicatorRed>) }
          </CheckPermissions>
        </CardHeaderIndicatorsContainer>
      }
    </Wrapper>
  );
};

ItemHeader.propTypes = {
  active: PropTypes.bool,
  isDelailedView: PropTypes.bool,
  blocked: PropTypes.bool,
  blockedThread: PropTypes.bool,
  isNew: PropTypes.bool,
  isAbuseReported: PropTypes.bool,
  abuseReports: PropTypes.array,
  onReportsClick: PropTypes.func,
};

export default ItemHeader;