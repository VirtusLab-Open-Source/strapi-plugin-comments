const pluginPermissions = {
  // This permission regards the main component (App) and is used to tell
  // If the plugin link should be displayed in the menu
  // And also if the plugin is accessible. This use case is found when a user types the url of the
  // plugin directly in the browser
  main: [
    { action: 'plugins::comments.read', subject: null },
    { action: 'plugins::comments.moderate.block.comment', subject: null },
    { action: 'plugins::comments.moderate.block.thread', subject: null },
    { action: 'plugins::comments.moderate.reports', subject: null },
  ],
  open: [
    { action: 'plugins::comments.read', subject: null },
  ],
  moderate: [
    { action: 'plugins::comments.read', subject: null },
    { action: 'plugins::comments.moderate.block.comment', subject: null },
    { action: 'plugins::comments.moderate.block.thread', subject: null },
  ],
  moderateComments: [
    { action: 'plugins::comments.read', subject: null },
    { action: 'plugins::comments.moderate.block.comment', subject: null },
  ],
  moderateThreads: [
    { action: 'plugins::comments.read', subject: null },
    { action: 'plugins::comments.moderate.block.thread', subject: null },
  ],
  moderateReports: [
    { action: 'plugins::comments.read', subject: null },
    { action: 'plugins::comments.moderate.reports', subject: null },
  ],
};

export default pluginPermissions;
