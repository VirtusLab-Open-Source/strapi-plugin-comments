import { StrapiAdminInstance } from "strapi-typed";
import { commentsCustomField } from "./comments";

export const registerCustomFields = (app: StrapiAdminInstance) => {
  if (!canRegister(app)) {
    return;
  }

  app.customFields.register(commentsCustomField);
};

const canRegister = (app: StrapiAdminInstance) => !!app.customFields;
