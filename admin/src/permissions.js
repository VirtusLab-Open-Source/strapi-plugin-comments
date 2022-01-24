const permissions = require('./../../permissions');

const pluginPermissions = {
    access: [
      { action: permissions.render(permissions.comments.read), subject: null },
      { action: permissions.render(permissions.reports.read), subject: null },
      // { action: 'plugin::comments.discover.read', subject: null },
      { action: permissions.render(permissions.settings.read), subject: null },
    ],
    // discover: [{ action: 'plugin::comments.discover.read', subject: null }],
    moderate: [{ action: permissions.render(permissions.comments.moderate), subject: null }],
    reports: [{ action: permissions.render(permissions.reports.read), subject: null }],
    reportsReview: [{ action: permissions.render(permissions.reports.action), subject: null }],
  };
  
  export default pluginPermissions;