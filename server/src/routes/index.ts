import adminRoutes from './admin.routes';
import clientRoutes from './client.routes';

const routes = {
  'content-api': {
    type: 'content-api',
    routes: clientRoutes,
  },
  admin: {
    type: 'admin',
    routes: adminRoutes,
  },
};

export default routes;
