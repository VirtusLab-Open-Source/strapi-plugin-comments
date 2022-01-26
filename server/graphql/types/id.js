const { isNumber, parseInt } = require('lodash');
const { Kind } = require('graphql');

module.exports = ({ nexus }) => nexus.scalarType({
  name: "Id",
  asNexusMethod: 'id',
  description: 'Id as string or int',
  parseValue(value) {
    const parsedValue = parseInt(value);
    if (isNumber(parsedValue)) {
      return parsedValue;
    }
    return value;
  },
  serialize(value) {
    return value;
  },
  parseLiteral(ast) {
    if ([Kind.INT, Kind.STRING].includes(ast.kind)) {
      return ast.value;
    }
    return null
  },
})