import { StrapiContext } from '../@types-v5';
import { registerCustomFields } from './custom-fields';

const register = (context: StrapiContext) => {
  registerCustomFields(context);
};


export default register;
