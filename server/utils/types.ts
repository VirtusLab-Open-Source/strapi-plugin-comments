import { Effect } from "../../types/utils";

export type ContentType = "comment" | "comment-report";

export type LifeCycleHookName =
  | "beforeCreate"
  | "beforeCreateMany"
  | "afterCreate"
  | "afterCreateMany"
  | "beforeUpdate"
  | "beforeUpdateMany"
  | "afterUpdate"
  | "afterUpdateMany"
  | "beforeDelete"
  | "beforeDeleteMany"
  | "afterDelete"
  | "afterDeleteMany"
  | "beforeCount"
  | "afterCount"
  | "beforeFindOne"
  | "afterFindOne"
  | "beforeFindMany"
  | "afterFindMany";

export interface LifeCycleEvent<
  THookName extends LifeCycleHookName = LifeCycleHookName,
  TResult = unknown,
  TParams = Record<string, unknown>
> {
  action: THookName;
  model: {
    singularName: string;
    uid: string;
    tableName: string;
    attributes: Record<string, unknown>;
    lifecycles: Partial<Record<LifeCycleHookName, Effect<LifeCycleEvent>>>;
    indexes: Array<{
      type?: string;
      name: string;
      columns: string[];
    }>;
    columnToAttribute: Record<string, string>;
  };
  state: Record<string, unknown>;
  params: TParams;
  result?: TResult | TResult[];
}
