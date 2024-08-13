export type Override<T, U extends { [Key in keyof T]?: unknown }> = Omit<
  T,
  keyof U
> &
  U;

export type Entries<T> = Array<
  keyof T extends infer U ? (U extends keyof T ? [U, T[U]] : never) : never
>;

export type ArrayElem<ArrayType extends readonly unknown[]> =
  ArrayType extends ReadonlyArray<infer ElementType> ? ElementType : never;

export type OmitStrict<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type Nullable<T> = T | null | undefined;
