import { StrapiContext } from "strapi-typed";
import { commentsCustomField } from "./comments";

export const registerCustomFields = ({ strapi }: StrapiContext) => {
  if (!canRegister({ strapi })) {
    return;
  }

  strapi.customFields.register(commentsCustomField);
};

const canRegister = ({ strapi }: StrapiContext) => !!strapi.customFields;
