import { REGEX } from "./constants";

const getRelatedGroups = related => related.split(REGEX.relatedUid).filter(s => s && s.length > 0);

export default getRelatedGroups;
