import * as pluginPkg from "../../package.json";

export const pluginId = pluginPkg.name.replace(/^strapi-plugin-/i, "");
