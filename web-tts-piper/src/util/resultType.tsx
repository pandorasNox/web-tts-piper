export type Result<T, E> = Ok<T> | Err<E>;

export class Ok<T> {
  readonly ok = true;
  constructor(public readonly value: T) {}
}

export class Err<E> {
  readonly ok = false;
  constructor(public readonly error: E) {}
}

export async function toResult<T>(promise: Promise<T>): Promise<Result<T, Error>> {
  try {
    const value = await promise;
    return { ok: true, value };
  } catch (error) {
    return { ok: false, error: error as Error };
  }
}
