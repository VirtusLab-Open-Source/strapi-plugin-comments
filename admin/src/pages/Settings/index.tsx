import { useNotification, useTracking } from '@strapi/strapi/admin';
import { QueryClient, QueryClientProvider, UseQueryResult } from '@tanstack/react-query';
import { first, isNil } from 'lodash';
import { useState } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { getMessage, parseRegExp } from '../../utils';
import { useSettingsAPI } from './hooks/useSettingsAPI';

const Settings = () => {
  const { trackUsage } = useTracking();
  const { toggleNotification } = useNotification();
  const [isRestartRequired, setIsRestartRequired] = useState(false);
  const [contentTypeExpanded, setContentTypeExpanded] = useState<string>();
  const { isLoadingForPermissions, ...allowedActions } = usePermissions();

  const {
    config,
    collectionTypes,
    roles,
    restoreSettingsMutation,
    updateSettingsMutation,
    restartStrapiMutation,
  } = useSettingsAPI();

  if (
    config.status !== 'success' ||
    collectionTypes.status !== 'success' ||
    roles.status !== 'success' ||
    isLoadingForPermissions
  ) {
    // TODO
    return getMessage('page.settings.loading');
  }
  const { flags, value } = parseRegExp(config.data.regex.uid);
  const regexUID = new RegExp(value, flags);
  const allCollections = collectionTypes.data.filter(ct => ct.uid.includes('api::'));
  const enabledCollections = config.data.enabledCollections
                                   .filter((uid: string) => allCollections.some(ct => ct.uid === uid));
  const badWords = isNil(config.data.badWords) ? true : config.data?.badWords;
  const gqlAuthEnabled = Boolean(config.data.gql?.auth || null);
  const moderatorRoles = config.data.moderatorRoles
                               .filter((role: string) => roles.data.filter((r) => r.code === role));
  const clientUrl = config.data.client?.url;
  const clientEmail = config.data.client?.contactEmail;
  const blockedAuthorProps = config.data.blockedAuthorProps ?? [];
  console.log('moderatorRoles', moderatorRoles);
  return null;
};

const queryClient = new QueryClient();

export default () => (
  <QueryClientProvider client={queryClient}>
    <Settings />
  </QueryClientProvider>
);