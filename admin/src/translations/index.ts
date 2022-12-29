import { KeyValueSet } from "strapi-typed";
import en from "./en.json";
import fr from "./fr.json";
import ptBr from "./pt-BR.json";

export type TranslationKey = "en" | "fr" | "pt-BR";
export type Translations = {
  [key in TranslationKey]: KeyValueSet<string>
};

const trads: Translations = {
  en,
  fr,
  "pt-BR": ptBr,
};

export default trads;
