import comment from './comments';
import commentReport from './report';

const contentTypes = {
  comment,
  'comment-report': commentReport,
};

export type ContentTypes = typeof contentTypes;
export type KeysContentTypes = keyof ContentTypes;
export type CommentsContentTypes = {
  [K in KeysContentTypes]: `plugin::comments.${K}`;
};
export type ContentTypesUUIDs = CommentsContentTypes[keyof CommentsContentTypes] | 'admin::user' | 'plugin::users-permissions.user';
export default contentTypes;
