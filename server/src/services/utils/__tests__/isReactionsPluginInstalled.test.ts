import { CoreStrapi } from '../../../@types';
import { caster } from '../../../test/utils';

describe('isReactionsPluginInstalled', () => {
  it('returns true when reactions plugin is available', () => {
    const strapi = caster<CoreStrapi>({
      plugin: jest.fn().mockReturnValue({}),
    });

    expect(!!strapi.plugin('reactions')).toBe(true);
    expect(strapi.plugin).toHaveBeenCalledWith('reactions');
  });

  it('returns false when reactions plugin is not available', () => {
    const strapi = caster<CoreStrapi>({
      plugin: jest.fn().mockReturnValue(undefined),
    });

    expect(!!strapi.plugin('reactions')).toBe(false);
  });
});
