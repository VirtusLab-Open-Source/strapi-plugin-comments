/**
 *
 * AbuseReportsPopUp
 *
 */

import React from 'react';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';
import {
  ButtonModal,
  HeaderModal,
  HeaderModalTitle,
  Modal,
  ModalBody,
  ModalForm,
  useGlobalContext,
  CheckPermissions,
} from 'strapi-helper-plugin';
import { Table, Button } from '@buffetjs/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faSmile,
} from '@fortawesome/free-solid-svg-icons';
import TableContainer from './TableContainer';
import EmptyView from '../EmptyView';
import ItemDetails from '../ItemDetails';
import ItemPreviewContainer from './ItemPreviewContainer';
import ModalFooter from './ModalFooter';
import pluginId from '../../pluginId';

// Translations
import en from '../../translations/en.json';
import pluginPermissions from '../../permissions';

const CustomRow = props => {
  const { row, formatMessage, onClick } = props;
  const { created_at, reason, content } = row;
  return (<tr>
      <td>{ created_at }</td>
      <td>{ reason }</td>
      <td><em>{ content }</em></td>
      <td style={{ textAlign: 'right' }}><Button
        onClick={onClick}
        color="secondary"
        icon={<FontAwesomeIcon icon={faCheck} />} 
        label={formatMessage({ id: `${pluginId}.popup.reports.item.button` })}
      /></td>
    </tr>);
}

const AbuseReportsPopUp = ({ isOpen, reports, comment, blocked, blockedThread, onBlockClick, onBlockThreadClick, onClose, onAbuseReportResolveClick }) => {

  const { formatMessage } = useGlobalContext();

  const resolveReportReason = reason => formatMessage({ id: `${pluginId}.popup.reports.item.reason.${reason.toLowerCase()}`});

  const headers = [
    {
      name: formatMessage({ id: `${pluginId}.popup.reports.item.header.date` }),
      value: 'created_at',
    },
    {
      name: formatMessage({ id: `${pluginId}.popup.reports.item.header.reason` }),
      value: 'reason',
    },
    {
      name: formatMessage({ id: `${pluginId}.popup.reports.item.header.message` }),
      value: 'content',
    },
    { value: 'actions' }
  ];

  const rows = reports.map(({ id, created_at, content, reason }) => ({
    id,
    created_at: moment(created_at).format('DD/MM/YYYY, HH:mm'),
    reason: resolveReportReason(reason),
    content,
  }));
  
  return (
    <CheckPermissions permissions={pluginPermissions.moderateReports}>
      <Modal isOpen={isOpen} onToggle={onClose}>
        <HeaderModal>
          <section>
            <HeaderModalTitle>
              <FormattedMessage id={`${pluginId}.popup.reports.header`} />
            </HeaderModalTitle>
          </section>
        </HeaderModal>
        <ModalForm>
          <ModalBody>
            <section style={{ width: '100%' }}>
              <ItemPreviewContainer>
                <ItemDetails root={true} {...comment} />
              </ItemPreviewContainer>
              { isEmpty(reports) && (
                <EmptyView>
                  <FontAwesomeIcon icon={faSmile} size="5x" />
                  <FormattedMessage id={`${pluginId}.popup.reports.empty`} />
                </EmptyView>
              ) }
              { !isEmpty(reports) && (<TableContainer>
                  <Table
                  customRow={props => (<CustomRow {...props} formatMessage={formatMessage} onClick={(e) => onAbuseReportResolveClick(e, props.row.id)} />)}
                  headers={headers}
                  rows={rows}
                />
              </TableContainer>)}
            </section>
          </ModalBody>
        </ModalForm>
        { !isEmpty(reports) && !blockedThread && !blocked && (<ModalFooter>
          <section>
            <label>
              <FormattedMessage id={`${pluginId}.popup.reports.footer.actions`} />
            </label>
            { !blockedThread && (<ButtonModal
              onClick={e => onBlockClick(comment.id)}
              isSecondary
              message={`${pluginId}.list.item.moderation.button.comment.hide`} />)}
            <ButtonModal 
              onClick={e => onBlockThreadClick(comment.id)}
              isSecondary
              message={`${pluginId}.list.item.moderation.button.thread.hide`} />
          </section>
        </ModalFooter>)}
      </Modal>
    </CheckPermissions>
  );
}

AbuseReportsPopUp.propTypes = {
  blocked: PropTypes.bool,
  blockedThread: PropTypes.bool,
  reports: PropTypes.array,
  comment: PropTypes.object.isRequired,
  onBlockClick: PropTypes.func.isRequired,
  onBlockThreadClick: PropTypes.func.isRequired,
  onAbuseReportResolveClick: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};

export default AbuseReportsPopUp;
