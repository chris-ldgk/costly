export type Plain<T> = T extends undefined
  ? undefined
  : T extends object
    ? Omit<T, typeof Symbol.dispose>
    : T;

export function plain<T>(value: T): Plain<T> {
  return value as Plain<T>;
}
