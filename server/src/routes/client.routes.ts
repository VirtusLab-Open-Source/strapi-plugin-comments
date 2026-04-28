import { StrapiRoute } from '../@types';

const routes: StrapiRoute<'client'>[] = [
  {
    method: 'GET',
    path: '/:relation',
    handler: 'client.findAllInHierarchy',
    config: {
      policies: [],
      description:
        'Find all comments related to configured Collection / Single Type and return them in a nested structure',
      tag: {
        plugin: 'comments',
        name: 'Comments',
        actionType: 'find',
      },
    },
  },
  {
    method: 'POST',
    path: '/:relation',
    handler: 'client.post',
    config: {
      policies: [],
      description: 'Post a comment against configured Collection / Single Type',
      tag: {
        plugin: 'comments',
        name: 'Comments',
        actionType: 'create',
      },
    },
  },
  {
    method: 'GET',
    path: '/:relation/flat',
    handler: 'client.findAllFlat',
    config: {
      policies: [],
      description:
        'Find all comments related to configured Collection / Single Type and return them in a flat structure for further processing',
      tag: {
        plugin: 'comments',
        name: 'Comments',
        actionType: 'find',
      },
    },
  },
  {
    method: 'PUT',
    path: '/:relation/moderate/single/:commentId/block',
    handler: 'client.blockComment',
    config: {
      policies: [],
      description: 'Block a comment',
      tag: {
        plugin: 'comments',
        name: 'Comments',
        actionType: 'update',
      },
    },
  },
  {
    method: 'PUT',
    path: '/:relation/moderate/single/:commentId/unblock',
    handler: 'client.unblockComment',
    config: {
      policies: [],
      description: 'Unblock a comment',
      tag: {
        plugin: 'comments',
        name: 'Comments',
        actionType: 'update',
      },
    },
  },
  {
    method: 'PUT',
    path: '/:relation/moderate/thread/:commentId/block',
    handler: 'client.blockCommentThread',
    config: {
      policies: [],
      description: 'Block a comment and its thread',
      tag: {
        plugin: 'comments',
        name: 'Comments',
        actionType: 'update',
      },
    },
  },
  {
    method: 'PUT',
    path: '/:relation/moderate/thread/:commentId/unblock',
    handler: 'client.unblockCommentThread',
    config: {
      policies: [],
      description: 'Unblock a comment thread',
      tag: {
        plugin: 'comments',
        name: 'Comments',
        actionType: 'update',
      },
    },
  },
  {
    method: 'PUT',
    path: '/:relation/moderate/single/:commentId/approve',
    handler: 'client.approveComment',
    config: {
      policies: [],
      description: 'Approve a comment',
      tag: {
        plugin: 'comments',
        name: 'Comments',
        actionType: 'update',
      },
    },
  },
  {
    method: 'PUT',
    path: '/:relation/moderate/single/:commentId/reject',
    handler: 'client.rejectComment',
    config: {
      policies: [],
      description: 'Reject a comment',
      tag: {
        plugin: 'comments',
        name: 'Comments',
        actionType: 'update',
      },
    },
  },
  {
    method: 'PUT',
    path: '/:relation/moderate/single/:commentId/report/:reportId/resolve',
    handler: 'client.resolveAbuseReport',
    config: {
      policies: [],
      description: 'Resolve a single abuse report for a comment',
      tag: {
        plugin: 'comments',
        name: 'Comments',
        actionType: 'update',
      },
    },
  },
  {
    method: 'PUT',
    path: '/:relation/moderate/single/:commentId/report/resolve',
    handler: 'client.resolveCommentMultipleAbuseReports',
    config: {
      policies: [],
      description: 'Resolve selected abuse reports for a comment',
      tag: {
        plugin: 'comments',
        name: 'Comments',
        actionType: 'update',
      },
    },
  },
  {
    method: 'PUT',
    path: '/:relation/moderate/all/:commentId/reports/resolve-all',
    handler: 'client.resolveAllAbuseReportsForComment',
    config: {
      policies: [],
      description: 'Resolve all abuse reports for a comment',
      tag: {
        plugin: 'comments',
        name: 'Comments',
        actionType: 'update',
      },
    },
  },
  {
    method: 'PUT',
    path: '/:relation/moderate/all/:commentId/reports/resolve-thread',
    handler: 'client.resolveAllAbuseReportsForThread',
    config: {
      policies: [],
      description:
        'Resolve all unresolved abuse reports for a comment and its thread',
      tag: {
        plugin: 'comments',
        name: 'Comments',
        actionType: 'update',
      },
    },
  },
  {
    method: 'PUT',
    path: '/:relation/moderate/multiple/reports/resolve-multiple',
    handler: 'client.resolveMultipleAbuseReports',
    config: {
      policies: [],
      description: 'Resolve multiple abuse reports by id across comments',
      tag: {
        plugin: 'comments',
        name: 'Comments',
        actionType: 'update',
      },
    },
  },
  {
    method: 'PUT',
    path: '/:relation/comment/:commentId',
    handler: 'client.put',
    config: {
      policies: [],
      description:
        'Update comment related to configured Collection / Single Type if user is the author',
      tag: {
        plugin: 'comments',
        name: 'Comments',
        actionType: 'update',
      },
    },
  },
  {
    method: 'POST',
    path: '/:relation/comment/:commentId/report-abuse',
    handler: 'client.reportAbuse',
    config: {
      policies: [],
      description: 'Report an abuse against comment for configured Collection / Single Type',
      tag: {
        plugin: 'comments',
        name: 'Comments',
        actionType: 'create',
      },
    },
  },
  {
    method: 'DELETE',
    path: '/:relation/comment/:commentId',
    handler: 'client.removeComment',
    config: {
      policies: [],
      description:
        'Remove comment related to configured Collection / Single Type if user is the author',
      tag: {
        plugin: 'comments',
        name: 'Comments',
        actionType: 'delete',
      },
    },
  },
  {
    method: 'GET',
    path: '/author/:authorId',
    handler: 'client.findAllPerAuthor',
    config: {
      policies: [],
      description: 'Find all comments created by Strapi user',
      tag: {
        plugin: 'comments',
        name: 'Comments',
        actionType: 'find',
      },
    },
  },
  {
    method: 'GET',
    path: '/author/:authorId/:type',
    handler: 'client.findAllPerAuthor',
    config: {
      policies: [],
      description: 'Find all comments created by specified type of user',
      tag: {
        plugin: 'comments',
        name: 'Comments',
        actionType: 'find',
      },
    },
  },
];

export default routes;
