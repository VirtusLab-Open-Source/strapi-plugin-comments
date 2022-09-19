import { Comment } from "./contentTypes";

// TODO => change to arrow function
export function assertComment(value: any): asserts value is Comment {
  if (!(value.id && value.content)) {
    throw new Error("Provided value is not Comment type");
  }
}
export type Effect<T> = (value: T) => void
export type VoidEffect = Effect<void>export type Effect<T> = (value: T) => void

export type VoidEffect = Effect<void>