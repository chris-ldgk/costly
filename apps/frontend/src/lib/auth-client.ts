import { createAuthClient } from "better-auth/client";
import { emailOTPClient } from "better-auth/client/plugins";
import { publicEnv } from "#/utils/env.ts";

export const authClient = createAuthClient({
  baseURL: publicEnv.VITE_API_URL,
  plugins: [emailOTPClient()],
});

export type AuthClient = typeof authClient;
