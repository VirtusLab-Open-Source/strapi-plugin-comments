import { CoreStrapi } from '../@types';
import { ContentTypesUUIDs, KeysContentTypes } from '../content-types';

export const getModelUid = (strapi: CoreStrapi, name: KeysContentTypes): ContentTypesUUIDs => {
  return strapi.plugin('comments').contentType(name)?.uid;
};

export const getDefaultAuthorPopulate = (strapi: CoreStrapi) => {
  const strapiUserTypeUid = 'plugin::users-permissions.user';
  const allowedTypes = ['media', 'relation'];

  const { attributes } = strapi.contentType(strapiUserTypeUid) ?? { attributes: {} };
  const relationTypes = Object.keys(attributes)?.filter((key: string) =>
    allowedTypes.includes(attributes[key]?.type),
  );

  if (relationTypes.includes('avatar')) {
    return {
      populate: { avatar: true },
    };
  }

  return true;
};

export function getOrderBy(orderBy?: string | null) {
  return typeof orderBy === 'string' ? orderBy.split(':') : 'createdAt:desc'.split(':');
}
