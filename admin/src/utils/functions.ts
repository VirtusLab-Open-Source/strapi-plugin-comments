import { ValidationError } from "./errors";

export function assertString(value: unknown): asserts value is string {
  if (typeof value === "string") {
    return;
  }

  throw new ValidationError(`String expected, but "${typeof value}" given`);
}
