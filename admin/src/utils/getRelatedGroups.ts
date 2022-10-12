type Config = {
  regex: {
    relatedUid: string;
  };
};

const getRelatedGroups = (related: string, config: Config) =>
  related.split(config.regex.relatedUid).filter((s) => s && s.length > 0);

export default getRelatedGroups;
