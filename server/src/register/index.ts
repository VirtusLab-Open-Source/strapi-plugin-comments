import { StrapiContext } from '../@types';
import { registerCustomFields } from './custom-fields';
import { getPluginService } from '../utils/getPluginService';

const register = (context: StrapiContext) => {
  registerCustomFields(context);

  const commonService = getPluginService(context.strapi, 'common');
  context.strapi.documents.use(async (ctx, next) => {
    if (ctx.action === 'delete') {
      const { params: { locale, documentId }, uid } = ctx;
      const relation = [uid, documentId].join(":");
      await commonService.perRemove(relation, locale);
    }
    return next();
  });
};

export default register;