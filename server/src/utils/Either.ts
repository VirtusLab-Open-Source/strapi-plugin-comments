export type Left<T> = {
  left: T;
  right?: never;
};

export type Right<U> = {
  left?: never;
  right: U;
};


export type ExtractRightEither<T> = T extends Right<any> ? T['right'] : never;


export type Either<T, U> = NonNullable<Left<T> | Right<U>>;

export type UnwrapEither = <T, U>(e: Either<T, U>) => NonNullable<T | U>;

export const unwrapEither: UnwrapEither = <T, U>({
  left,
  right,
}: Either<T, U>) => {
  if (right !== undefined && left !== undefined) {
    throw new Error(
      `Received both left and right values at runtime when opening an Either
      Left: ${JSON.stringify(left)}
      Right: ${JSON.stringify(right)}`,
    );
    /*
     We're throwing in this function because this can only occur at runtime if something
     happens that the TypeScript compiler couldn't anticipate. That means the application
     is in an unexpected state and we should terminate immediately.
     */
  }
  if (left !== undefined) {
    return left as NonNullable<T>; // Typescript is getting confused and returning this type as `T | undefined` unless we add the type assertion
  }
  if (right !== undefined) {
    return right as NonNullable<U>;
  }
  throw new Error(
    `Received no left or right values at runtime when opening Either`,
  );
};

export const isLeft = <T, U>(e: Either<T, U>): e is Left<T> => {
  return e.left !== undefined;
};

export const isRight = <T, U>(e: Either<T, U>): e is Right<U> => {
  return e.right !== undefined;
};

export const makeLeft = <T>(value: T): Left<T> => ({ left: value });

export const makeRight = <U>(value: U): Right<U> => ({ right: value });
