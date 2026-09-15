import contentTypes from './content-types';
import register from "./register";
import bootstrap from "./bootstrap";
import config from "./config";
import controllers from "./controllers";
import routes from "./routes";
import services from "./services";

type CommentsPlugin = {
  register: typeof register;
  bootstrap: typeof bootstrap;
  config: typeof config;
  controllers: typeof controllers;
  routes: typeof routes;
  services: typeof services;
  contentTypes: typeof contentTypes;
};

const plugin: CommentsPlugin = {
  register,
  bootstrap,
  config,
  controllers,
  routes,
  services,
  contentTypes,
};

export default plugin;
