import adminController from "./admin";
import clientController from "./client";

type PluginControllers = {
  [key: string]: Function | Object;
};

const controllers: PluginControllers = {
  admin: adminController,
  client: clientController,
};

export default controllers;
