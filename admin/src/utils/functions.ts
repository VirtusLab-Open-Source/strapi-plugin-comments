import { ValidationError } from "./errors";

type NonEmpty<T> = T extends null | undefined ? never : T;

export function assertString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new ValidationError(`String expected, but "${typeof value}" given`);
  }
}

export function assertNonEmpty<T>(value: unknown, error = new Error('Value is empty')): asserts value is NonEmpty<T> {
  if (value === null || value === undefined) {
    throw error;
  }
}