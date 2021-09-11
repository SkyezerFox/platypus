/**
 * A generic partial or optional type.
 */
export type Partional<T> = Partial<T> | undefined;

/**
 * A statement that is possibly awaitable.
 */
export type Awaitable<T> = T | Promise<T>;
