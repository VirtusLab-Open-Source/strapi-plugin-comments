import { StrapiRoute } from "strapi-typed";
import clientRoutes from "./client";
import adminRoutes from "./admin";

type PluginRoutes = {
  [key: string]: PluginScopeRoutes;
};

type PluginScopeRoutes = {
  type: string;
  routes: Array<StrapiRoute>;
};

const routes: PluginRoutes = {
  "content-api": {
    type: "content-api",
    routes: clientRoutes,
  },
  admin: {
    type: "admin",
    routes: adminRoutes,
  },
};

export default routes;
