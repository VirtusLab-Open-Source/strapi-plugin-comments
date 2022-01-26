const getRelatedGroups = (related, config) => related.split(config.regex.relatedUid).filter(s => s && s.length > 0);

export default getRelatedGroups;
