import { KeyValueSet } from "strapi-typed";
import en from "./en.json";
import es from "./es.json";
import fr from "./fr.json";
import pl from "./pl.json";
import ptBr from "./pt-BR.json";
import ru from "./ru.json";
import tr from "./tr.json";
import zhHans from "./zh-Hans.json";

export type TranslationKey = "en" | "fr" | "pt-BR" | "tr" | "ru" | "zh-Hans" | "pl"| "es";
export type Translations = {
  [key in TranslationKey]: KeyValueSet<string>
};

const trads: Translations = {
  en,
  fr,
  "pt-BR": ptBr,
  tr,
  ru,  
  "zh-Hans": zhHans,
  pl,
  es
};

export default trads;
