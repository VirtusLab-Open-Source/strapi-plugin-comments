import type { Core } from '@strapi/strapi';
import contentTypes from './content-types';
import register from "./register";
import bootstrap from "./bootstrap";
import config from "./config";
import controllers from "./controllers";
import routes from "./routes";
import services from "./services";

const plugin: Core.Plugin = {
  register,
  bootstrap,
  config,
  controllers,
  routes,
  services,
  contentTypes,
} as unknown as Core.Plugin;

export default plugin;
