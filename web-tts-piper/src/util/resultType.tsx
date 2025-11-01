export type Result<T, E> = Ok<T> | Err<E>;

export class Ok<T> {
  readonly ok = true;
  constructor(public readonly value: T) {}
}

export class Err<E> {
  readonly ok = false;
  constructor(public readonly error: E) {}
}
