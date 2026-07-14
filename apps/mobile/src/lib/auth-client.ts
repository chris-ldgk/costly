import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

const apiUrl = process.env.EXPO_PUBLIC_API_URL;
if (!apiUrl) {
  throw new Error("EXPO_PUBLIC_API_URL is required");
}

export const authClient = createAuthClient({
  baseURL: apiUrl,
  plugins: [
    expoClient({
      scheme: "costly",
      storagePrefix: "costly",
      storage: SecureStore,
    }),
    emailOTPClient(),
  ],
});

export type AuthClient = typeof authClient;
