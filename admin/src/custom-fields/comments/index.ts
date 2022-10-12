import { StrapiAdminCustomFieldRegisterInput } from "strapi-typed";
import { pluginId } from "../../pluginId";
import { CustomFieldIcon } from "./components";

export const commentsCustomField: StrapiAdminCustomFieldRegisterInput = {
  name: "comments",
  pluginId,
  type: "json",
  icon: CustomFieldIcon,
  intlLabel: {
    defaultMessage: "Comments",
    description: "",
    id: `${pluginId}.customField.comments.label`,
  },
  intlDescription: {
    defaultMessage: "Specify comments query params",
    description: "",
    id: `${pluginId}.customField.comments.description`,
  },
  components: {
    Input: async () => import("./components/input"),
  },
  options: {
    base: [],
    advanced: [],
    validator: () => ({}),
  },
};
