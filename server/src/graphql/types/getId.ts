import { Kind } from 'graphql';
import { isNumber } from 'lodash';
import { Nexus } from '../../@types-v5/graphql';

export const getIdType = (nexus: Nexus) => {
  return nexus.scalarType({
    name: 'ID',
    asNexusMethod: 'id',
    description: 'id as string or integer',
    serialize: (value: string) => value,
    parseValue(value: string) {
      const parsedValue = parseInt(value);
      if (isNumber(parsedValue)) {
        return parsedValue;
      }
      return value;
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT || ast.kind === Kind.STRING) {
        return ast.value;
      }
      return null;
    },
  });
};
