import adminController from "./admin.controller";
import clientController from "./client.controller";
import settingsController from './settings.controller';


const controllers = {
  admin: adminController,
  client: clientController,
  settings: settingsController
};

export type PluginControllers = {
  [key in keyof typeof controllers]: ReturnType<typeof controllers[key]>;
}

export default controllers;
