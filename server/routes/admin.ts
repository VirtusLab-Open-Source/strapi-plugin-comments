import { StrapiRoute } from "strapi-typed";

const routes: StrapiRoute[] = [
  {
    method: "GET",
    path: "/moderate/config",
    handler: "admin.config",
    config: {
      policies: [],
    },
  },
  {
    method: "GET",
    path: "/moderate/all",
    handler: "admin.findAll",
    config: {
      policies: [],
    },
  },
  {
    method: "GET",
    path: "/moderate/reports",
    handler: "admin.findReports",
    config: {
      policies: [],
    },
  },
  {
    method: "GET",
    path: "/moderate/single/:id",
    handler: "admin.findOne",
    config: {
      policies: [],
    },
  },
  {
    method: "PATCH",
    path: "/moderate/single/:id/approve",
    handler: "admin.approveComment",
    config: {
      policies: [],
    },
  },
  {
    method: "PATCH",
    path: "/moderate/single/:id/reject",
    handler: "admin.rejectComment",
    config: {
      policies: [],
    },
  },
  {
    method: "PATCH",
    path: "/moderate/single/:id/block",
    handler: "admin.blockComment",
    config: {
      policies: [],
    },
  },
  {
    method: "PATCH",
    path: "/moderate/single/:id/unblock",
    handler: "admin.unblockComment",
    config: {
      policies: [],
    },
  },
  {
    method: "PATCH",
    path: "/moderate/single/:id/report/:reportId/resolve",
    handler: "admin.resolveAbuseReport",
    config: {
      policies: [],
    },
  },
  {
    method: "PUT",
    path: "/moderate/single/:id/report/resolve",
    handler: "admin.resolveCommentMultipleAbuseReports",
    config: {
      policies: [],
    },
  },
  {
    method: "PUT",
    path: "/moderate/all/:id/report/resolve",
    handler: "admin.resolveAllAbuseReportsForComment",
    config: {
      policies: [],
    },
  },
  {
    method: "PUT",
    path: "/moderate/all/:id/report/resolve-thread",
    handler: "admin.resolveAllAbuseReportsForThread",
    config: {
      policies: [],
    },
  },
  {
    method: "PUT",
    path: "/moderate/multiple/report/resolve",
    handler: "admin.resolveMultipleAbuseReports",
    config: {
      policies: [],
    },
  },
  {
    method: "PATCH",
    path: "/moderate/thread/:id/block",
    handler: "admin.blockCommentThread",
    config: {
      policies: [],
    },
  },
  {
    method: "PATCH",
    path: "/moderate/thread/:id/unblock",
    handler: "admin.unblockCommentThread",
    config: {
      policies: [],
    },
  },
  {
    method: "GET",
    path: "/settings/config",
    handler: "admin.settingsConfig",
    config: {
      policies: [],
    },
  },
  {
    method: "PUT",
    path: "/settings/config",
    handler: "admin.settingsUpdateConfig",
    config: {
      policies: [],
    },
  },
  {
    method: "DELETE",
    path: "/settings/config",
    handler: "admin.settingsRestoreConfig",
    config: {
      policies: [],
    },
  },
  {
    method: "GET",
    path: "/settings/restart",
    handler: "admin.settingsRestart",
    config: {
      policies: [],
    },
  },
];

export default routes;
