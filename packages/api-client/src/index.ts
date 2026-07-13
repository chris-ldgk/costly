import { hc } from "hono/client";
import type { AppRouter } from "@costly/api";

export type ApiClient = ReturnType<typeof hc<AppRouter>>;

export function createApiClient(
  ...args: Parameters<typeof hc<AppRouter>>
): ApiClient {
  return hc<AppRouter>(...args);
}
