/**
 * NoAcccessPage
 *
 * This is the page we show when the user do not have appropriate credentials
 * 
 */

// TODO
// @ts-nocheck

import React from 'react';
import { useFocusWhenNavigate, LinkButton } from '@strapi/helper-plugin';
import { Main } from '@strapi/design-system/Main';
import { ContentLayout, HeaderLayout } from '@strapi/design-system/Layout';
import { EmptyStateLayout } from '@strapi/design-system/EmptyStateLayout';
import { emptyPictures, arrowRight } from '../../components/icons';
import { useIntl } from 'react-intl';

const NoAcccessPage = () => {
  const { formatMessage } = useIntl();
  useFocusWhenNavigate();

  return (
    <Main labelledBy="title">
      <HeaderLayout
        id="title"
        title={formatMessage({
          id: 'page.auth.noAccess',
          defaultMessage: 'No access',
        })}
      />
      <ContentLayout>
        <EmptyStateLayout
          action={
            <LinkButton variant="secondary" endIcon={arrowRight} to="/">
              {formatMessage({
                id: 'components.notAccessPage.back',
                defaultMessage: 'Back to homepage',
              })}
            </LinkButton>
          }
          content={formatMessage({
            id: 'page.auth.not.allowed',
            defaultMessage: "Oops! It seems like You do not have access to this page...",
          })}
          hasRadius
          icon={emptyPictures}
          shadow="tableShadow"
        />
      </ContentLayout>
    </Main>
  );
};

export default NoAcccessPage;
