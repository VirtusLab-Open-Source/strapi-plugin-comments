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
      settingsChange: pluginPermissions.settingsChange,
    }),
    [],
  );
  const {
    isLoading: isLoadingForPermissions,
    allowedActions: {
      canCommentsModerate,
      canCommentsRead,
      canReportsRead,
      canSettingsChange,
      canSettingsRead,
      canReportsReview,
    },
  } = useRBAC(viewPermissions);
  return {
    isLoadingForPermissions,
    canAccess: canCommentsRead || canReportsRead || canSettingsRead,
    canModerate: canCommentsModerate,
    canAccessReports: canReportsRead,
    canReviewReports: canReportsReview,
    canSettings: canSettingsRead,
    canSettingsChange: canSettingsChange,
  };
};
