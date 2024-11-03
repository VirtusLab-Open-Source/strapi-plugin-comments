import { useRBAC } from '@strapi/strapi/admin';
import { useMemo } from 'react';
import pluginPermissions from '../permissions';

export const usePermissions = () => {
  const viewPermissions = useMemo(
    () => ({
      access: pluginPermissions.access,
      moderate: pluginPermissions.moderate,
      accessReports: pluginPermissions.reports,
      reviewReports: pluginPermissions.reportsReview,
      settings: pluginPermissions.settings,
      canSettingsChange: pluginPermissions.settingsChange,
    }),
    [],
  );
  const {
    isLoading: isLoadingForPermissions,
    allowedActions: {
      canAccess,
      canModerate,
      canAccessReports,
      canReviewReports,
      ...rest
    },
  } = useRBAC(viewPermissions);
  return {
    isLoadingForPermissions,
    canAccess: canAccess ?? true,
    canModerate: canModerate ?? true,
    canAccessReports: canAccessReports ?? true,
    canReviewReports: canReviewReports ?? true,
    canSettings: true,
    canSettingsChange: true,
  };
};