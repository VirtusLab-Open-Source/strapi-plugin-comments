import { CoreStrapi } from '../../../@types';
import { caster } from '../../../test/utils';
import { registerCustomFields } from '../index';

describe('registerCustomFields()', () => {
  it('should apply custom field when strapi supports it', () => {
    const strapi = caster<CoreStrapi>({
      customFields: {
        register: jest.fn(),
      },
    });

    registerCustomFields({ strapi });

    expect(strapi.customFields.register).toHaveBeenCalled();
    expect(strapi.customFields.register).toHaveBeenCalledTimes(1);
    expect(strapi.customFields.register).toHaveBeenCalledWith({ name: 'comments', plugin: 'comments', type: 'json' });
  });
  it('should not require custom fields functionality to bootstrap comments plugin', () => {
    const strapi = caster<CoreStrapi>({ log: { warn: jest.fn() } });
    expect(() => registerCustomFields({ strapi })).not.toThrow();
  });
  it('should notify about custom field option', () => {
    const strapi = caster<CoreStrapi>({ log: { warn: jest.fn() } });
    expect(() => registerCustomFields({ strapi })).not.toThrow();
    expect(strapi.log.warn).toHaveBeenCalled();
  });
});
