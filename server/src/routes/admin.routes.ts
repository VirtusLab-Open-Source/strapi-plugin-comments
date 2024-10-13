import { StrapiRoute } from '../@types-v5';

const adminRoutes: StrapiRoute<'admin'>[] = [
  {
    method: 'GET',
    path: '/moderate/all',
    handler: 'admin.findAll',
    config: {
      auth: false, //TODO: remove all auth: false
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/moderate/reports',
    handler: 'admin.findReports',
    config: {
      auth: false,
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/moderate/single/:id',
    handler: 'admin.findOne',
    config: {
      auth: false,
      policies: [],
    },
  },
  {
    method: 'PATCH',
    path: '/moderate/single/:id/approve',
    handler: 'admin.approveComment',
    config: {
      auth: false,
      policies: [],
    },
  },
  {
    method: 'PATCH',
    path: '/moderate/single/:id/reject',
    handler: 'admin.rejectComment',
    config: {
      auth: false,
      policies: [],
    },
  },
  {
    method: 'PATCH',
    path: '/moderate/single/:id/block',
    handler: 'admin.blockComment',
    config: {
      auth: false,
      policies: [],
    },
  },
  {
    method: 'PATCH',
    path: '/moderate/single/:id/unblock',
    handler: 'admin.unblockComment',
    config: {
      auth: false,
      policies: [],
    },
  },
  {
    method: 'DELETE',
    path: '/moderate/single/:id/delete',
    handler: 'admin.deleteComment',
    config: {
      auth: false,
      policies: [],
    },
  },
  {
    method: 'PATCH',
    path: '/moderate/single/:id/report/:reportId/resolve',
    handler: 'admin.resolveAbuseReport',
    config: {
      auth: false,
      policies: [],
    },
  },
  {
    method: 'PUT',
    path: '/moderate/single/:id/report/resolve',
    handler: 'admin.resolveCommentMultipleAbuseReports',
    config: {
      auth: false,
      policies: [],
    },
  },
  {
    method: 'PUT',
    path: '/moderate/all/:id/report/resolve',
    handler: 'admin.resolveAllAbuseReportsForComment',
    config: {
      auth: false,
      policies: [],
    },
  },
  {
    method: 'PUT',
    path: '/moderate/all/:id/report/resolve-thread',
    handler: 'admin.resolveAllAbuseReportsForThread',
    config: {
      auth: false,
      policies: [],
    },
  },
  {
    method: 'PUT',
    path: '/moderate/multiple/report/resolve',
    handler: 'admin.resolveMultipleAbuseReports',
    config: {
      auth: false,
      policies: [],
    },
  },
  {
    method: 'PUT',
    path: '/moderate/single/:id/update',
    handler: 'admin.updateComment',
    config: {
      auth: false,
      policies: [],
    },
  },
  {
    method: 'PATCH',
    path: '/moderate/thread/:id/block',
    handler: 'admin.blockCommentThread',
    config: {
      auth: false,
      policies: [],
    },
  },
  {
    method: 'PATCH',
    path: '/moderate/thread/:id/unblock',
    handler: 'admin.unblockCommentThread',
    config: {
      auth: false,
      policies: [],
    },
  },
  {
    method: 'POST',
    path: '/moderate/thread/:id/postComment',
    handler: 'admin.postComment',
    config: {
      auth: false,
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
      auth: false,
      policies: [],
    },
  },
  {
    method: 'DELETE',
    path: '/settings/config',
    handler: 'settings.restore',
    config: {
      auth: false,
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/settings/restart',
    handler: 'settings.restart',
    config: {
      auth: false,
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/settings/config',
    handler: 'settings.getForSettingsPage',
    config: {
      auth: false,
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/moderate/config',
    handler: 'settings.get',
    config: {
      auth: false,
      policies: [],
    },
  },
];

export default [
  ...adminRoutes,
  ...settingsRoutes,
];
