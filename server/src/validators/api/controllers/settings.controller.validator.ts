import { schemaConfig } from '../../../config';
import { validate } from '../../utils';

export const validateConfig = (config: unknown) => {
  return validate(schemaConfig.safeParse(config));
};
