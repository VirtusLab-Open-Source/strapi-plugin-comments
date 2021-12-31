const pluginPermissions = {
    access: [
      { action: 'plugin::comments.read', subject: null },
      { action: 'plugin::comments.reports.read', subject: null },
      { action: 'plugin::comments.discovery.read', subject: null },
      { action: 'plugin::comments.settings.read', subject: null },
    ],
    discover: [{ action: 'plugin::comments.read', subject: null }],
    moderate: [{ action: 'plugin::comments.moderate', subject: null }],
    reports: [{ action: 'plugin::comments.reports.read', subject: null }],
    reportsReview: [{ action: 'plugin::comments.reports.action', subject: null }],
  };
  
  export default pluginPermissions;