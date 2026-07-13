import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { magicLink } from "better-auth/plugins";
import type { Lib } from "../utils/lib";
import { authSchema } from "../schema";
import { parseAllowedUsers } from "./allowed-users";
import { sendMagicLinkEmail } from "../emails/send-magic-link";

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
        sendMagicLink: async ({ email, url }) => {
          if (!allowedEmails.has(email.toLowerCase())) {
            throw new Error("Email not allowed");
          }

          if (env.NODE_ENV === "development") {
            console.log(`[Costly] Magic link for ${email}: ${url}`);
            return;
          }

          if (!env.RESEND_API_KEY) {
            throw new Error("RESEND_API_KEY is required to send magic link emails");
          }

          await sendMagicLinkEmail({
            apiKey: env.RESEND_API_KEY,
            from: env.RESEND_FROM_EMAIL,
            to: email,
            url,
          });
        },
      }),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;
