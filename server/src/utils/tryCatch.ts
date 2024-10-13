import { makeLeft, makeRight } from './Either';

export const tryCatch = async <T, E>(callback: () => T, throwError: E) => {
  try {
    return makeRight(await callback());
  } catch {
    return makeLeft(throwError);
  }
};