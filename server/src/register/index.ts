import { StrapiContext } from 'strapi-typed';
import { registerCustomFields } from './custom-fields';

const register = (context: StrapiContext) => {
  registerCustomFields(context);
};


export default register;
