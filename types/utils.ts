import { Comment } from "./contentTypes";

export function assertComment(value: any): asserts value is Comment {
  if (!(value.id && value.content)) {
    throw new Error("Provided value is not Comment type");
  }
}
