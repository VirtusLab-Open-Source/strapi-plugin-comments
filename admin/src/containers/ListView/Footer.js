import React, { memo } from 'react';
import { FormattedMessage } from 'react-intl';
import { GlobalPagination, InputSelect, sizes } from 'strapi-helper-plugin';
import useDataManager from '../../hooks/useDataManager';
import { FooterWrapper, SelectWrapper, Label } from './components';

function Footer() {
  const {
    search: { _limit, _page },
    itemsTotal,
    handleChangeParams
  } = useDataManager();

  return (
    <FooterWrapper className="row">
      <div className="col-6">
        <SelectWrapper style={{ marginBottom: `${2*sizes.margin}px` }}>
          <InputSelect
            style={{ width: '75px', height: '32px', marginTop: '-1px' }}
            name="_limit"
            onChange={handleChangeParams}
            selectOptions={['10', '20', '50', '100']}
            value={_limit}
          />
          <Label htmlFor="_limit" style={{
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            display: 'inline-block',
            whiteSpace: 'nowrap'
          }}>
            <FormattedMessage id="components.PageFooter.select" />
          </Label>
        </SelectWrapper>
      </div>
      <div className="col-6">
        <GlobalPagination
          style={{ marginBottom: `${2*sizes.margin}px` }}
          count={itemsTotal}
          onChangeParams={({ target: { value } }) => {
            handleChangeParams({ target: { name: '_page', value } });
          }}
          params={{
            currentPage: parseInt(_page, 10),
            _limit: parseInt(_limit, 10),
            _page: parseInt(_page, 10),
          }}
        />
      </div>
    </FooterWrapper>
  );
}

export default memo(Footer);
