'use strict';

const permissions = require('./../permissions');

module.exports = async ({ strapi }) => {
  // Check if the plugin users-permissions is installed because the navigation needs it
  if (Object.keys(strapi.plugins).indexOf("users-permissions") === -1) {
    throw new Error(
      "In order to make the comments plugin work the users-permissions plugin is required",
    );
  }
  // Add permissions
  const actions = [
    {
      section: "plugins",
      displayName: "Comments: Read",
      uid: permissions.comments.read,
      pluginName: "comments",
    },
    {
      section: "plugins",
      displayName: "Comments: Moderate",
      uid: permissions.comments.moderate,
      pluginName: "comments",
    },
    {
      section: "plugins",
      displayName: "Reports: Read",
      uid: permissions.reports.read,
      pluginName: "comments",
    },
    {
      section: "plugins",
      displayName: "Reports: Moderate",
      uid: permissions.reports.action,
      pluginName: "comments",
    },
  ];

  await strapi.admin.services.permission.actionProvider.registerMany(actions);
};
