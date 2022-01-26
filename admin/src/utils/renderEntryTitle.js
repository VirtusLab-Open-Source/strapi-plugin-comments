import { first } from 'lodash';

const renderEntryTitle = (entry, config = {}) => {
    const { entryLabel } = config;
    const rule = entry.uid in entryLabel ? entryLabel[entry.uid] : entryLabel['*'];
    return first(
      Object.keys(entry)
        .filter(_ => (rule === _) || rule.includes(_))
        .map(_ => entry[_])
        .filter(_ => _)
    );
  };

export default renderEntryTitle;