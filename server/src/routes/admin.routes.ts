import { StrapiRoute } from '../@types-v5';

const adminRoutes: StrapiRoute<'admin'>[] = [
  {
    method: 'GET',
    path: '/moderate/all',
    handler: 'admin.findAll',
    config: {
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/moderate/reports',
    handler: 'admin.findReports',
    config: {
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/moderate/single/:id',
    handler: 'admin.findOne',
    config: {
      policies: [],
    },
  },
  {
    method: 'PUT',
    path: '/moderate/single/:id/approve',
    handler: 'admin.approveComment',
    config: {
      policies: [],
    },
  },
  {
    method: 'PUT',
    path: '/moderate/single/:id/reject',
    handler: 'admin.rejectComment',
    config: {
      policies: [],
    },
  },
  {
    method: 'PUT',
    path: '/moderate/single/:id/block',
    handler: 'admin.blockComment',
    config: {
      policies: [],
    },
  },
  {
    method: 'PUT',
    path: '/moderate/single/:id/unblock',
    handler: 'admin.unblockComment',
    config: {
      policies: [],
    },
  },
  {
    method: 'DELETE',
    path: '/moderate/single/:id/delete',
    handler: 'admin.deleteComment',
    config: {
      policies: [],
    },
  },
  {
    method: 'PUT',
    path: '/moderate/single/:id/report/:reportId/resolve',
    handler: 'admin.resolveAbuseReport',
    config: {
      policies: [],
    },
  },
  {
    method: 'PUT',
    path: '/moderate/single/:id/report/resolve',
    handler: 'admin.resolveCommentMultipleAbuseReports',
    config: {
      policies: [],
    },
  },
  {
    method: 'PUT',
    path: '/moderate/all/:id/report/resolve',
    handler: 'admin.resolveAllAbuseReportsForComment',
    config: {
      policies: [],
    },
  },
  {
    method: 'PUT',
    path: '/moderate/all/:id/report/resolve-thread',
    handler: 'admin.resolveAllAbuseReportsForThread',
    config: {
      policies: [],
    },
  },
  {
    method: 'PUT',
    path: '/moderate/multiple/report/resolve',
    handler: 'admin.resolveMultipleAbuseReports',
    config: {
      policies: [],
    },
  },
  {
    method: 'PUT',
    path: '/moderate/single/:id/update',
    handler: 'admin.updateComment',
    config: {
      policies: [],
    },
  },
  {
    method: 'PUT',
    path: '/moderate/thread/:id/block',
    handler: 'admin.blockCommentThread',
    config: {
      policies: [],
    },
  },
  {
    method: 'PUT',
    path: '/moderate/thread/:id/unblock',
    handler: 'admin.unblockCommentThread',
    config: {
      policies: [],
    },
  },
  {
    method: 'POST',
    path: '/moderate/thread/:id/postComment',
    handler: 'admin.postComment',
    config: {
      policies: [],
    },
  },
];

const settingsRoutes: StrapiRoute<'settings'>[] = [
  {
    method: 'PUT',
    path: '/settings/config',
    handler: 'settings.update',
    config: {
      policies: [],
    },
  },
  {
    method: 'DELETE',
    path: '/settings/config',
    handler: 'settings.restore',
    config: {
      policies: [],
    },
  },
  {
    method: 'POST',
    path: '/settings/restart',
    handler: 'settings.restart',
    config: {
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/settings/config',
    handler: 'settings.getForSettingsPage',
    config: {
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/moderate/config',
    handler: 'settings.get',
    config: {
      policies: [],
    },
  },
];

export default [
  ...adminRoutes,
  ...settingsRoutes,
];
