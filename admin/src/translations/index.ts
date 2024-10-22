export type TranslationKey = keyof typeof trads;
const trads  = {
  en: () => import('./en'),
  fr: () => import('./fr'),
  'pt-BR': () => import('./pt-BR'),
  tr: () => import('./tr'),
  ru: () => import('./ru'),
  'zh-Hans': () => import('./zh-Hans'),
  pl: () => import('./pl'),
};

export default trads;
