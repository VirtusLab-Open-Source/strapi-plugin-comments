import { Modules } from '@strapi/strapi';

type DynamicValue = Modules.Documents.Params.Filters.Operator.DynamicValue;
type Group = Modules.Documents.Params.Filters.Operator.Group;
type BooleanValue = Modules.Documents.Params.Filters.Operator.BooleanValue;

type Condition = {
  [key in DynamicValue]?:
  | boolean
  | string
  | null
  | Record<string, { [key in DynamicValue]?: Condition }>;
};

type Groups = {
  [group in Group]?: Array<Record<string, Condition>>;
};
type Boolean = {
  [value: string]: { [key in BooleanValue]?: boolean; };
};
export type Where = Groups & Boolean;
export type DBQuery = {
  _q?: string;
  where: Where;
  orderBy?: Record<string, string> | string;
  offset: number;
  limit: number;
};