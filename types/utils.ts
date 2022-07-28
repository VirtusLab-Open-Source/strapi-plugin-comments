export type Effect<T> = (value: T) => void
export type VoidEffect = Effect<void>