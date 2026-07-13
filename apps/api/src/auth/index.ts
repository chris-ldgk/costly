import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { magicLink } from "better-auth/plugins";
import type { Lib } from "../utils/lib";
import { authSchema } from "../schema";
import { parseAllowedUsers } from "./allowed-users";

export function createAuth(lib: Lib) {
  const { env, db } = lib;
  const allowedEmails = new Set(
    parseAllowedUsers(env.ALLOWED_USERS).map((u) => u.email.toLowerCase()),
  );

  return betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: env.CORS_ORIGINS,
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: authSchema,
    }),
    emailAndPassword: {
      enabled: false,
    },
    plugins: [
      magicLink({
        disableSignUp: true,
        sendMagicLink: ({ email, url }) => {
          if (!allowedEmails.has(email.toLowerCase())) {
            throw new Error("Email not allowed");
          }
          if (env.NODE_ENV === "development") {
            console.log(`[Costly] Magic link for ${email}: ${url}`);
            return;
          }
          console.log(`[Costly] Magic link for ${email}: ${url}`);
        },
      }),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;
