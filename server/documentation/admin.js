export const adminPaths = {
        "/moderate/config": {
            get: {
                responses: {200: {description: "Get configuration"}}
            }
        },
        "/moderate/all": {
        get: {
          responses: { 200: { description: "Get all comments" }}
        }
      },
      "/moderate/reports": {
        get: {
            responses: {200: {description: "Get all reports"}}
        }
      },
      "/moderate/single/:id": {
        get: {
            responses: {200: {description: "Get single comment by id"}}
        }
      },
      "/moderate/single/:id/approve": {
        patch: {
            responses: {200: {description: "Update comment status to 'Approved' "}}
        }
      },
      "/moderate/single/:id/reject": {
        patch: {
            responses: {200: {description: "Update comment status to 'Rejected' "}}
        }
      },
      "/moderate/single/:id/block": {
        patch: {
            responses: {200: {description: "Block comment that is not an admin comment"}}
        }
      },
      "/moderate/single/:id/unblock": {
        patch: {
            responses: {200: {description: "Unblock comment"}}
        }
      },
      "/moderate/single/:id/delete": {
        delete: {
            responses: {200: {description: "Delete single comment"}}
        }
      },
      "/moderate/single/:id/report/:reportId/resolve": {
        patch: {
            responses: {200: {description: "Resolve single abuse report to specyfic comment "}}
        }
      },
      "/moderate/single/:id/report/resolve": {
        put: {
            responses: {200: {description: "Resolve multiple abuse reports to specyfic comment"}}
        }
      },
      "/moderate/all/:id/report/resolve": {
        put: {
            responses: {200: {description: "Resolve all abuse reports to specyfic comment"}}
        }
      },
      "/moderate/all/:id/report/resolve-thread": {
        put: {
            responses: {200: {description: "Resolve all abuse reports for thread"}}
        }
      },
      "/moderate/multiple/report/resolve": {
        put: {
            responses: {200: {description: "Resolve multiple abuse reports"}}
        }
      },
      "/moderate/single/:id/update": {
        put: {
            responses: {200: {description: "Update content of single comment"}}
        }
      },
      "/moderate/thread/:id/block": {
        patch: {
            responses: {200: {description: "Block thread of specyfic comment"}}
        }
      },
      "/moderate/thread/:id/unblock": {
        patch: {
            responses: {200: {description: "Unblock thread of specyfic comment"}}
        }
      },
      "/moderate/thread/:id/postComment": {
        post: {
            responses: {200: {description: "Post comment to thread of specyfic comment"}}
        }
      },
      "/settings/config": {
        get: {
            responses: {200: {description: "Get settings configuration"}}
        }
      },
      "/settings/config": {
        put: {
            responses: {200: {description: "Update settings configuration"}}
        }
      },
      "/settings/config": {
        delete: {
            responses: {200: {description: "Restore settings configuration"}}
        }
      },
      "/settings/restart": {
        get: {
            responses: {200: {description: "Restart settings configuration"}}
        }
      }
}