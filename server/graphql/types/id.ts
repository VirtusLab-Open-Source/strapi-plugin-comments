import { Primitive } from "strapi-typed";
import { NexusAst, StrapiGraphQLContext } from "../../../types";

const { isNumber, parseInt } = require("lodash");
const { Kind } = require("graphql");

export = ({ nexus }: StrapiGraphQLContext) =>
  nexus.scalarType({
    name: "Id",
    asNexusMethod: "id",
    description: "Id as string or int",
    parseValue(value: Primitive) {
      const parsedValue = parseInt(value);
      if (isNumber(parsedValue)) {
        return parsedValue;
      }
      return value;
    },
    serialize(value: Primitive) {
      return value;
    },
    parseLiteral(ast: NexusAst) {
      if ([Kind.INT, Kind.STRING].includes(ast.kind)) {
        return ast.value;
      }
      return null;
    },
  });
