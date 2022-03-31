import { ToBeFixed } from "../../../types";

const getRelatedGroups = (related: string, config: ToBeFixed) =>
  related.split(config.regex.relatedUid).filter((s) => s && s.length > 0);

export default getRelatedGroups;
