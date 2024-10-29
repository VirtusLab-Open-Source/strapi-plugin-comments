import { Primitive, StrapiContext } from "strapi-typed";
import { ToBeFixed } from './utils';

export type StrapiGraphQLContext = StrapiContext;

export interface INexusType {
  field(name: string, config?: ToBeFixed): void;
  id(name: string);
  boolean(name: string);
  string(name: string);
  int(name: string);

  nonNull: INexusType;
  list: INexusType;
}

export type NexusRequestProps<T = ToBeFixed> = {
  input?: T;
};

export type NexusAst = {
  kind: string;
  value: Primitive;
};
