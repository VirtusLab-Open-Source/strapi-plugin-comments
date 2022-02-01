module.exports = async () => {
  // Check if the plugin users-permissions is installed because the comments needs it
  if (Object.keys(strapi.plugins).indexOf('users-permissions') === -1) {
    throw new Error(
      'In order to make the comments plugin work the users-permissions plugin is required'
    );
  }

  // Add permissions
  const actions = [
    {
      section: 'plugins',
      displayName: 'Access',
      uid: 'read',
      pluginName: 'comments',
    },
    {
      section: 'plugins',
      displayName: 'Moderation',
      uid: 'moderate',
      pluginName: 'comments',
    },
    {
      section: 'plugins',
      displayName: 'Block single comment',
      uid: 'moderate.block.comment',
      subCategory: 'moderate',
      pluginName: 'comments',
    },
    {
      section: 'plugins',
      displayName: 'Block comments threads',
      uid: 'moderate.block.thread',
      subCategory: 'moderate',
      pluginName: 'comments',
    },
    {
      section: 'plugins',
      displayName: 'Review & resolve reports',
      uid: 'moderate.reports',
      subCategory: 'moderate',
      pluginName: 'comments',
    },
    {
      section: 'plugins',
      displayName: 'Approving comments',
      uid: 'moderate.approve.comment',
      subCategory: 'moderate',
      pluginName: 'comments',
    },
    {
      section: 'plugins',
      displayName: 'Rejecting comments',
      uid: 'moderate.reject.comment',
      subCategory: 'moderate',
      pluginName: 'comments',
    },
  ];

  const { actionProvider } = strapi.admin.services.permission;
  await actionProvider.registerMany(actions);
};
