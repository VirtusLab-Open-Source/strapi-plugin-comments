import { Core } from '@strapi/strapi';
import { z, ZodArray, ZodObject, ZodRawShape } from 'zod';
import { CoreStrapi } from '../@types-v5';
import { ContentTypesUUIDs, KeysContentTypes } from '../content-types';

export const getModelUid = (strapi: Core.Strapi, name: KeysContentTypes): ContentTypesUUIDs => {
  return strapi.plugin('comments').contentType(name)?.uid;
};

export const getDefaultAuthorPopulate = (strapi: CoreStrapi) => {
  const strapiUserTypeUid = 'plugin::users-permissions.user';
  const allowedTypes = ['media', 'relation'];

  const { attributes } = strapi.contentTypes[strapiUserTypeUid] || {};
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

export const shouldValidate = <T extends ZodRawShape>(isEnabled: boolean, validator: z.ZodAny) => {
  return isEnabled ? validator.parse : (args:T) => args as z.infer<typeof validator>;
};