import { StrapiContext } from '../../@types';
import { commentsCustomField } from './comments';

export const registerCustomFields = ({ strapi }: StrapiContext) => {
  if (!canRegister({ strapi })) {
    strapi.log.warn(
      "[Comments Plugin] Custom fields disabled. Upgrade Strapi to use custom fields."
    );

    return;
  }

  strapi.customFields.register(commentsCustomField);
};

const canRegister = ({ strapi }: StrapiContext) => !!strapi.customFields;
