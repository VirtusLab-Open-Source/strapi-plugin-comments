'use strict';

const permissions = require('./../permissions');
const { getPluginService } = require('./utils/functions');

module.exports = async ({ strapi }) => {

  // Provide GQL support
  if (strapi.plugin('graphql')) {
    const config = await getPluginService('common').getConfig();
    await require('./graphql')({ strapi, config });
  }

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
    {
      section: "plugins",
      displayName: "Settings: Read",
      uid: permissions.settings.read,
      pluginName: "comments",
    },
    {
      section: "plugins",
      displayName: "Settings: Change",
      uid: permissions.settings.change,
      pluginName: "comments",
    },
  ];

  await strapi.admin.services.permission.actionProvider.registerMany(actions);
};
