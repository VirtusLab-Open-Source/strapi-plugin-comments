const parseRegExp = (regexpString: string) => {
  const [value, flags] = regexpString.split("/").filter((_) => _.length > 0);
  return {
    value,
    flags,
  };
};

export default parseRegExp;
