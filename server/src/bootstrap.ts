import { StrapiContext } from './@types';
import { setupGQL } from './graphql';
import permissions from './permissions';
import { getPluginService } from './utils/getPluginService';

export default async ({ strapi }: StrapiContext) => {
  if (strapi.plugin('graphql')) {
    await setupGQL({ strapi });
  }
  // Check if the plugin users-permissions is installed because the navigation needs it
  if (Object.keys(strapi.plugins).indexOf('users-permissions') === -1) {
    throw new Error(
      'In order to make the comments plugin work the users-permissions plugin is required',
    );
  }
  // Add permissions
  const actions = [
    {
      section: 'plugins',
      displayName: 'Comments: Read',
      uid: permissions.comments.read,
      pluginName: 'comments',
    },
    {
      section: 'plugins',
      displayName: 'Comments: Moderate',
      uid: permissions.comments.moderate,
      pluginName: 'comments',
    },
    {
      section: 'plugins',
      displayName: 'Reports: Read',
      uid: permissions.reports.read,
      pluginName: 'comments',
    },
    {
      section: 'plugins',
      displayName: 'Reports: Moderate',
      uid: permissions.reports.review,
      pluginName: 'comments',
    },
    {
      section: 'plugins',
      displayName: 'Settings: Read',
      uid: permissions.settings.read,
      pluginName: 'comments',
    },
    {
      section: 'plugins',
      displayName: 'Settings: Change',
      uid: permissions.settings.change,
      pluginName: 'comments',
    },
  ];

  await strapi.admin.services.permission.actionProvider.registerMany(actions);

  const commonService = getPluginService(strapi, 'common');
  strapi.db.lifecycles.subscribe({
    afterDelete: async (event) => {
      const uid = event.model.uid;
      const { documentId, locale } = event.result;
      const relation = [uid, documentId].join(':');
      await commonService.perRemove(relation, locale);
    },
    afterCreate: async (event) => {
      const uid = event.model.uid;
      const { documentId, locale } = event.result;
      const relation = [uid, documentId].join(':');
      await commonService.perRestore(relation, locale);
    }
  });
};
