import { createApiClient } from "@costly/api-client";
import { authClient } from "./auth-client";

const apiUrl = process.env.EXPO_PUBLIC_API_URL;
if (!apiUrl) {
  throw new Error("EXPO_PUBLIC_API_URL is required");
}

export function createAuthenticatedClient() {
  return createApiClient(apiUrl, {
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      const cookies = authClient.getCookie();
      if (cookies) {
        headers.set("Cookie", cookies);
      }
      return fetch(input, { ...init, headers, credentials: "omit" });
    },
  });
}

type JsonResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

export async function unwrapJson<T>(res: JsonResponse): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}
