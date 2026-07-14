export type Plain<T> = T extends undefined
  ? undefined
  : T extends object
    ? Omit<T, typeof Symbol.dispose>
    : T;

/** Release a Cloudflare Workers RPC result (and any stubs it contains). */
export function disposeRpcResult(value: unknown): void {
  if (
    value !== null &&
    typeof value === "object" &&
    Symbol.dispose in value &&
    typeof (value as { [Symbol.dispose]: () => void })[Symbol.dispose] ===
      "function"
  ) {
    (value as { [Symbol.dispose]: () => void })[Symbol.dispose]();
  }
}

/**
 * Copy RPC data into a plain JSON-serializable value.
 * Avoid structuredClone — Cloudflare RPC proxies can recurse infinitely.
 */
export function toPlainValue<T>(value: T): Plain<T> {
  if (value === null || value === undefined) {
    return value as Plain<T>;
  }
  if (typeof value !== "object") {
    return value as Plain<T>;
  }
  return JSON.parse(JSON.stringify(value)) as Plain<T>;
}

/**
 * Run an RPC call, map its value, and always dispose the RPC result.
 * @see https://developers.cloudflare.com/workers/runtime-apis/rpc/lifecycle/
 */
export async function withRpc<T, R>(
  promise: Promise<T>,
  select: (value: T) => R,
): Promise<R> {
  const value = await promise;
  try {
    return select(value);
  } finally {
    disposeRpcResult(value);
  }
}

/** Clone an RPC return value for serialization, then dispose the RPC result. */
export async function rpcPlain<T>(promise: Promise<T>): Promise<Plain<T>> {
  return withRpc(promise, toPlainValue);
}
