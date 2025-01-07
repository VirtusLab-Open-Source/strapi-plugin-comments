import { StrapiContext } from '../@types';
import { registerCustomFields } from './custom-fields';

const register = (context: StrapiContext) => {
  registerCustomFields(context);
};


export default register;
