import { createAuthClient } from "better-auth/client";
import { magicLinkClient } from "better-auth/client/plugins";
import { publicEnv } from "#/utils/env.ts";

export const authClient = createAuthClient({
  baseURL: publicEnv.VITE_PUBLIC_URL,
  plugins: [magicLinkClient()],
});

export type AuthClient = typeof authClient;
