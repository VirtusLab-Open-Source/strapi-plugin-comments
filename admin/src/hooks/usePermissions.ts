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
    },
  } = useRBAC(viewPermissions);
  return {
    isLoadingForPermissions,
    canAccess: canAccess ?? true,
    canModerate: canModerate ?? true,
    canAccessReports: canAccessReports ?? true,
    canReviewReports: canReviewReports ?? true,
  };
};